/**
 * Toma un JSON clínico crudo (string o objeto) y lo convierte a:
 * - paciente: nombre del paciente
 * - transcription: nota formateada en Markdown con **SECCIÓN:**
 * - vitals: signos vitales extraídos
 * - rawText: el texto crudo original
 */

export interface ParsedClinicalData {
  paciente: string;
  transcription: string;
  vitals?: {
    ta: string; fc: string; fr: string; temp: string;
    sat: string; peso: string; talla: string; imc: string;
  };
  rawText: string;
}

export function formatClinicalJson(input: string | object): ParsedClinicalData {
  let cleanObj: any = null;
  let rawText = typeof input === 'string' ? input : JSON.stringify(input);

  // Si es string, intentar parsearlo como JSON
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        cleanObj = JSON.parse(trimmed);
      } catch (e) {
        // Intentar limpiar bloques markdown
        try {
          const cleaned = trimmed
            .replace(/```(?:json)?/gi, '')
            .replace(/```/g, '')
            .replace(/^text:\s*/i, '')
            .trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanObj = JSON.parse(jsonMatch[0]);
          }
        } catch (e2) { /* no es JSON */ }
      }
    }
  } else if (typeof input === 'object' && input !== null) {
    cleanObj = input;
  }

  // Si no se pudo parsear, devolver como texto plano
  if (!cleanObj || typeof cleanObj !== 'object') {
    return {
      paciente: 'Paciente Nuevo',
      transcription: rawText,
      rawText: rawText,
    };
  }

  // Desempaquetar payload / data si viene encapsulado por n8n ({ success: true, payload: { ... } })
  if (cleanObj.payload && typeof cleanObj.payload === 'object') {
    cleanObj = cleanObj.payload;
  } else if (cleanObj.data && typeof cleanObj.data === 'object') {
    cleanObj = cleanObj.data;
  }

  // 1. PACIENTE
  let paciente = cleanObj.paciente || cleanObj.Paciente || cleanObj.nombre_paciente || cleanObj.patient_name || 'Paciente Nuevo';
  if (paciente === 'Desconocido' || paciente === 'desconocido') {
    paciente = 'Paciente (Sin identificar)';
  }

  // 2. SIGNOS VITALES
  let vitals: ParsedClinicalData['vitals'] = undefined;
  const sv = cleanObj.signos_vitales || cleanObj.Signos_Vitales || cleanObj.vitals;
  if (sv && typeof sv === 'object') {
    vitals = {
      ta: sv.presion_arterial || sv.ta || '',
      fc: sv.frecuencia_cardiaca || sv.fc || '',
      fr: sv.frecuencia_respiratoria || sv.fr || '',
      temp: sv.temperatura || sv.temp || '',
      sat: sv.saturacion_oxigeno || sv.sat || '',
      peso: sv.peso || '',
      talla: sv.talla || '',
      imc: sv.imc || '',
    };
  }

  // 3. NOTA CLÍNICA → Markdown
  const nc = cleanObj.nota_clinica || cleanObj.Nota_Clinica || cleanObj.nota_limpia || cleanObj.Nota_Limpia || cleanObj.nota || cleanObj;
  let transcription = '';

  if (typeof nc === 'string') {
    transcription = nc;
    
    // Si la nota venía como string, pero hay un plan o receta a nivel raíz, agregarlos
    const extraBlocks = [];
    if (cleanObj.plan && Array.isArray(cleanObj.plan)) {
      const planItems = cleanObj.plan.map((v: any) => {
        if (typeof v === 'string') return `- ${v}`;
        const med = v.medicamento || v.terapia || 'Indicación';
        const parts = [v.dosis, v.indicacion, v.frecuencia, v.duracion, v.indicaciones].filter(Boolean);
        return `- ${String(med).toUpperCase()}${parts.length ? ` - ${parts.join(' | ')}` : ''}`;
      });
      extraBlocks.push(`**PLAN:**\n${planItems.join('\n')}`);
    }
    
    if (cleanObj.receta && Array.isArray(cleanObj.receta)) {
      const recetaItems = cleanObj.receta.map((v: any) => {
        if (typeof v === 'string') return `- ${v}`;
        const med = v.medicamento || v.terapia || 'Indicación';
        const parts = [v.dosis, v.indicacion, v.frecuencia, v.duracion, v.indicaciones].filter(Boolean);
        return `- ${String(med).toUpperCase()}${parts.length ? ` - ${parts.join(' | ')}` : ''}`;
      });
      extraBlocks.push(`**RECETA:**\n${recetaItems.join('\n')}`);
    }
    
    if (extraBlocks.length > 0) {
      transcription += '\n\n' + extraBlocks.join('\n\n');
    }
  } else if (typeof nc === 'object' && nc !== null) {
    const sectionsList = [
      { label: 'ANTECEDENTES HEREDOFAMILIARES', value: nc.antecedentes_heredofamiliares || cleanObj.antecedentes_heredofamiliares },
      { label: 'ANTECEDENTES PERSONALES NO PATOLÓGICOS', value: nc.antecedentes_personales_no_patologicos || cleanObj.antecedentes_personales_no_patologicos },
      { label: 'ANTECEDENTES PERSONALES PATOLÓGICOS', value: nc.antecedentes_personales_patologicos || cleanObj.antecedentes_personales_patologicos },
      { label: 'PADECIMIENTO ACTUAL', value: nc.padecimiento_actual || cleanObj.padecimiento_actual },
      { label: 'EXPLORACIÓN FÍSICA', value: nc.exploracion_fisica || cleanObj.exploracion_fisica },
      { label: 'IMPRESIÓN DIAGNÓSTICA', value: nc.impresion_diagnostica || cleanObj.impresion_diagnostica },
      { label: 'PLAN', value: cleanObj.plan || nc.plan },
      { label: 'RECETA', value: cleanObj.receta || cleanObj.Receta || nc.receta || nc.Receta },
    ];

    const formattedBlocks = sectionsList
      .filter(item => {
        if (!item.value) return false;
        if (Array.isArray(item.value)) return item.value.length > 0;
        return String(item.value).trim() !== '' && String(item.value).trim() !== '[INAUDIBLE]';
      })
      .map(item => {
        if (Array.isArray(item.value)) {
          const listItems = item.value.map((v: any) => {
            if (typeof v === 'string') return `- ${v}`;
            
            const med = v.medicamento || v.terapia || 'Indicación';
            const parts = [];
            if (v.dosis) parts.push(v.dosis);
            if (v.indicacion) parts.push(v.indicacion);
            if (v.frecuencia) parts.push(v.frecuencia);
            if (v.duracion) parts.push(v.duracion);
            if (v.indicaciones) parts.push(v.indicaciones);
            
            const desc = parts.join(' | ');
            return `- ${String(med).toUpperCase()}${desc ? ` - ${desc}` : ''}`;
          });
          return `**${item.label}:**\n${listItems.join('\n')}`;
        }
        return `**${item.label}:**\n${String(item.value).trim()}`;
      });

    if (formattedBlocks.length > 0) {
      transcription = formattedBlocks.join('\n\n');
    } else {
      // Mapeo dinámico de cualquier clave desconocida
      const ignoredKeys = new Set([
        'paciente', 'Paciente', 'nombre_paciente', 'patient_name',
        'signos_vitales', 'Signos_Vitales', 'vitals',
        'doctor_id', 'profileId', 'folder',
      ]);
      const customBlocks: string[] = [];
      Object.entries(nc).forEach(([k, v]) => {
        if (ignoredKeys.has(k) || !v) return;
        const header = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase();
        const valStr = typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v).trim();
        if (valStr) customBlocks.push(`**${header}:**\n${valStr}`);
      });
      if (customBlocks.length > 0) {
        transcription = customBlocks.join('\n\n');
      }
    }
  }

  // Fallback si no se pudo formatear
  if (!transcription) {
    transcription = rawText;
  }

  // Si los vitals siguen vacíos, intentar extraerlos con RegEx desde el texto formateado
  if (!vitals) {
    vitals = {} as any;
    const txt = transcription.toUpperCase();
    
    const pesoMatch = txt.match(/PESO[\s:]*(\d+(\.\d+)?)[\s]*(KG|KILOS)?/);
    if (pesoMatch) vitals!.peso = pesoMatch[1];
    
    const tempMatch = txt.match(/TEMP(?:ERATURA)?[\s:]*(\d+(\.\d+)?)[\s]*(C|GRADOS)?/);
    if (tempMatch) vitals!.temp = tempMatch[1];
    
    const satMatch = txt.match(/(?:SAT(?:URACIÓN)?|SPO2|OXIGENACIÓN|SATURACION)[\s:]*(\d+(\.\d+)?)[\s]*%/);
    if (satMatch) vitals!.sat = satMatch[1];

    const fcMatch = txt.match(/FC|FRECUENCIA CARD(?:I|Í)ACA[\s:]*(\d+)/);
    if (fcMatch) vitals!.fc = fcMatch[1];

    const taMatch = txt.match(/(?:TA|PRESI(?:O|Ó)N|TENSION)[\s:]*(\d{2,3}\/\d{2,3})/);
    if (taMatch) vitals!.ta = taMatch[1];

    if (Object.keys(vitals as any).length === 0) vitals = undefined;
  }

  // Forzar que el campo clínico contenga la alergia si se menciona explícitamente en texto plano pero no viene estructurado
  const alerMatch = transcription.match(/(?:ALERGIC[OA]|ALERGIA)(?: A LA| AL| A)?\s+([A-Za-z\s]+)/i);
  if (alerMatch && !transcription.includes('ANTECEDENTES PERSONALES PATOLÓGICOS:')) {
     const alergiaDetectada = alerMatch[1].trim();
     if (alergiaDetectada.length > 3) {
       transcription += `\n\n**ANTECEDENTES PERSONALES PATOLÓGICOS:**\nALERGIAS: ${alergiaDetectada}`;
     }
  }

  return { paciente, transcription, vitals, rawText };
}
