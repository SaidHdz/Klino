import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform, StyleSheet } from 'react-native';
import { ArrowLeft, Search, AlertTriangle, ChevronDown, Mic, Pencil, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

import { FadingScrollContainer } from '../components/common/FadingScrollContainer';

type TabType = 'Resumen' | 'Historia clínica' | 'Notas de evolución' | 'Labs e imagen' | 'Indicaciones' | 'Referencia' | 'Recetas';

const ALL_TABS: TabType[] = ['Resumen', 'Historia clínica', 'Notas de evolución', 'Labs e imagen', 'Indicaciones', 'Referencia', 'Recetas'];

export default function PatientTimelineScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Resumen');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="h3" style={{ fontSize: 18 }}>Expediente</KlinoText>
        </View>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Search size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* PATIENT INFO */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 }}>
        <View style={{ width: 64, height: 64, backgroundColor: KLINO_COLORS.verde, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
          <KlinoText variant="h2" color={KLINO_COLORS.papel}>RC</KlinoText>
        </View>
        <View style={{ flex: 1 }}>
          <KlinoText variant="h2" style={{ marginBottom: 4 }}>Ramiro Cepeda</KlinoText>
          <KlinoText variant="small" color={KLINO_COLORS.gris}>58 años · M · Exp. KL-0192 · Consultorio</KlinoText>
        </View>
      </View>

      {/* TABS */}
      <View style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <FadingScrollContainer contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48, gap: 24 }}>
          {ALL_TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{ 
                  backgroundColor: isActive ? KLINO_COLORS.verde : 'transparent',
                  paddingVertical: 12,
                  paddingHorizontal: isActive ? 16 : 0,
                }}
              >
                <KlinoText 
                  variant="label" 
                  color={isActive ? KLINO_COLORS.papel : KLINO_COLORS.gris}
                  style={{ fontWeight: 'bold' }}
                >
                  {tab}
                </KlinoText>
              </TouchableOpacity>
            )
          })}
        </FadingScrollContainer>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Resumen' && <ResumenTab router={router} />}
        {activeTab === 'Historia clínica' && <HistoriaClinicaTab />}
        {activeTab === 'Notas de evolución' && <NotasEvolucionTab />}
        {activeTab === 'Labs e imagen' && <LabsImagenTab />}
        {activeTab === 'Indicaciones' && <IndicacionesTab />}
        {activeTab === 'Referencia' && <ReferenciaTab />}
        {activeTab === 'Recetas' && <RecetasTab />}
      </ScrollView>

    </SafeAreaView>
  );
}

const ResumenTab = ({ router }: any) => (
  <View style={{ padding: 24 }}>
    
    {/* ALERGIAS */}
    <View style={{ borderWidth: 1, borderColor: '#C53030', padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
      <AlertTriangle size={24} color="#C53030" strokeWidth={1.5} style={{ marginRight: 16 }} />
      <View>
        <KlinoText variant="label" color="#C53030" style={{ letterSpacing: 1, marginBottom: 4 }}>ALERGIAS</KlinoText>
        <KlinoText variant="body" style={{ fontSize: 18 }}>Penicilina · reacción cutánea</KlinoText>
      </View>
    </View>

    {/* SIGNOS VITALES GRID */}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginBottom: 32 }}>
      <GridCell label="PRESIÓN" value="128/82" sub="hoy · estable" isRight />
      <GridCell label="GLUCOSA" value="112" sub="mg/dL · 2 jul" isBottom />
      <GridCell label="PESO / IMC" value="81.4" sub="kg · IMC 27.1" isRight isBottom />
      <GridCell label="HBA1C" value="6.9%" sub="18 abr · pendiente" isBottom />
    </View>

    {/* DIAGNÓSTICOS ACTIVOS */}
    <SectionTitle title="DIAGNÓSTICOS ACTIVOS" />
    <View style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline, marginBottom: 32 }}>
      <ListItem left="Hipertensión esencial" right="desde 2019" />
      <ListItem left="Diabetes mellitus tipo 2" right="desde 2021" />
    </View>

    {/* TRATAMIENTO ACTUAL */}
    <SectionTitle title="TRATAMIENTO ACTUAL" />
    <View style={{ marginBottom: 32 }}>
      <BoxItem title="Losartán 50 mg" subtitle="cada 24 h · desde 2 jul" />
      <BoxItem title="Metformina 850 mg" subtitle="con la comida · desde 2 jul" />
    </View>

    {/* ÚLTIMOS MOVIMIENTOS */}
    <SectionTitle title="ÚLTIMOS MOVIMIENTOS" />
    <View style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline, marginBottom: 32 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
        <View>
          <KlinoText variant="body" style={{ fontSize: 18, marginBottom: 4 }}>Historia clínica · hoy</KlinoText>
          <KlinoText variant="small" color={KLINO_COLORS.gris}>Dictada 16:30</KlinoText>
        </View>
        <TouchableOpacity style={{ backgroundColor: KLINO_COLORS.ambar, paddingHorizontal: 16, paddingVertical: 8 }}>
          <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold' }}>SIN APROBAR</KlinoText>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
        <View>
          <KlinoText variant="body" style={{ fontSize: 18, marginBottom: 4 }}>Laboratorios · 18 abr</KlinoText>
          <KlinoText variant="small" color={KLINO_COLORS.gris}>Química sanguínea</KlinoText>
        </View>
        <ChevronDown size={20} color={KLINO_COLORS.gris} />
      </View>
    </View>

    {/* BOTONES INFERIORES */}
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <TouchableOpacity 
        onPress={() => router.push('/live-consultation')}
        style={{ flex: 1, backgroundColor: KLINO_COLORS.verde, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Mic size={20} color={KLINO_COLORS.papel} strokeWidth={2} />
        <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.push('/scanner-select')}
        style={{ flex: 1, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
      >
        <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>ESCANEAR</KlinoText>
      </TouchableOpacity>
    </View>
  </View>
);

const HistoriaClinicaTab = () => (
  <View style={{ paddingBottom: 40 }}>
    
    {/* AVISO EDICION BLOQUEADA */}
    <View style={{ backgroundColor: KLINO_COLORS.papelHondo, padding: 24, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <Lock size={20} color={KLINO_COLORS.gris} style={{ marginRight: 16 }} />
      <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ flex: 1, lineHeight: 20 }}>
        Edición bloqueada. Toca el lápiz para desbloquear con tu huella.
      </KlinoText>
      <TouchableOpacity style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, padding: 12, backgroundColor: KLINO_COLORS.papel }}>
        <Pencil size={20} color={KLINO_COLORS.verde} />
      </TouchableOpacity>
    </View>

    <View style={{ padding: 24 }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 24 }}>HISTORIA CLÍNICA · 14 AGO 2026</KlinoText>

      <TextSection title="FICHA DE IDENTIFICACIÓN">
        Ramiro Cepeda Villalobos · 58 años · masculino · 12 mar 1968 · Monterrey, NL · casado · empleado administrativo
      </TextSection>

      <TextSection title="ANTECEDENTES HEREDOFAMILIARES">
        Padre con hipertensión y cardiopatía isquémica. Madre con diabetes tipo 2. Hermana con hipotiroidismo.
      </TextSection>

      <TextSection title="ANTECEDENTES PERSONALES NO PATOLÓGICOS">
        Alimentación irregular, alta en sodio. Sedentario. Tabaquismo suspendido hace 9 años. Alcohol ocasional.
      </TextSection>

      <TextSection title="ANTECEDENTES PERSONALES PATOLÓGICOS">
        Hipertensión esencial diagnosticada en 2019. Diabetes mellitus tipo 2 en 2021. Alergia a penicilina. Apendicectomía en 1994.
      </TextSection>

      <TextSection title="PADECIMIENTO ACTUAL">
        Acude a seguimiento. Refiere buena tolerancia al ajuste de dosis realizado el 2 de julio. Niega mareos, cefalea, edema o alteraciones visuales.
      </TextSection>

      <TextSection title="INTERROGATORIO POR APARATOS Y SISTEMAS">
        Cardiovascular sin dolor precordial ni disnea. Respiratorio sin tos. Digestivo sin cambios. Urinario con nicturia ocasional. Neurológico sin déficit.
      </TextSection>

      <TextSection title="EXPLORACIÓN FÍSICA">
        TA 128/82 · FC 74 · FR 16 · temperatura 36.5 · peso 81.4 kg · talla 1.73 m · IMC 27.1. Cardiopulmonar sin agregados. Abdomen blando. Sin edema en miembros inferiores.
      </TextSection>

      <TextSection title="DIAGNÓSTICOS">
        Hipertensión esencial en control. Diabetes mellitus tipo 2 con adherencia adecuada.
      </TextSection>

      <TextSection title="PLAN Y PRONÓSTICO">
        Continuar losartán 50 mg cada 24 h y metformina 850 mg con la comida. Control en 30 días con bitácora de presión. Solicitar HbA1c. Pronóstico bueno para la función.
      </TextSection>

      <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ marginTop: 24, lineHeight: 22 }}>
        Aprobada el 14 de agosto a las 16:52 por Dra. Andrea Solís, ced. 7841203. Para corregirla necesitas desbloquear la edición.
      </KlinoText>

    </View>
  </View>
);

const NotasEvolucionTab = () => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>6 NOTAS DE EVOLUCIÓN</KlinoText>
      <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
    </View>
    <RecordItem date="14 de agosto" status="SIN APROBAR" desc="Tolera el ajuste de dosis. TA 128/82, sin edema." />
    <RecordItem date="2 de julio" status="OK" desc="Se inicia losartán 50 mg. Promedio en casa 128/82." />
    <RecordItem date="18 de abril" status="OK" desc="Revisión de laboratorios. HbA1c 6.9%." />
  </View>
);

const LabsImagenTab = () => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>LABORATORIOS E IMAGEN</KlinoText>
      <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>ESCANEAR</KlinoText>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <View style={{ width: 48, height: 60, backgroundColor: KLINO_COLORS.papelHondo, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginRight: 16 }} />
      <View>
        <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Química sanguínea</KlinoText>
        <KlinoText variant="small" color={KLINO_COLORS.gris}>18 abr · escaneado · 2 hojas</KlinoText>
      </View>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <View style={{ width: 48, height: 60, backgroundColor: KLINO_COLORS.tinta, marginRight: 16 }} />
      <View>
        <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Radiografía de tórax</KlinoText>
        <KlinoText variant="small" color={KLINO_COLORS.gris}>3 mar · sin hallazgos</KlinoText>
      </View>
    </View>
    
    <View style={{ padding: 24 }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 24 }}>TENDENCIA DE HBA1C</KlinoText>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingHorizontal: 16 }}>
        <Bar value="7.8" height={100} />
        <Bar value="7.4" height={80} />
        <Bar value="7.1" height={70} />
        <Bar value="6.9" height={60} active />
      </View>
    </View>
  </View>
);

const Bar = ({ value, height, active }: any) => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ width: 60, height, backgroundColor: active ? KLINO_COLORS.verde : KLINO_COLORS.papelHondo, borderWidth: active ? 0 : 1, borderColor: KLINO_COLORS.borderStrong }} />
    <KlinoText variant="small" color={active ? KLINO_COLORS.verde : KLINO_COLORS.gris} style={{ marginTop: 8 }}>{value}</KlinoText>
  </View>
);

const IndicacionesTab = () => (
  <View>
    <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>HOJAS DE INDICACIONES</KlinoText>
    </View>
    <RecordItem date="Cuidados en casa · 14 ago" status="OK" desc="Medir presión dos veces al día. Dieta baja en sodio. Caminar 30 minutos." />
    <RecordItem date="Preparación de laboratorio · 10 abr" status="OK" desc="Ayuno de 8 horas. Suspender metformina la noche previa." />
    <View style={{ padding: 24 }}>
      <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ lineHeight: 22 }}>
        Las hojas de indicaciones se generan de lo que dictaste en el plan y se pueden mandar al paciente.
      </KlinoText>
    </View>
  </View>
);

const ReferenciaTab = () => (
  <View>
    <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>NOTAS DE REFERENCIA</KlinoText>
    </View>
    <RecordItem date="Cardiología" status="2 jul" desc="Envío para valoración de hipertensión de difícil control. Dr. Iván Rueda." />
    <RecordItem date="Nutrición" status="18 abr" desc="Plan de alimentación para diabetes tipo 2. Contrarreferencia recibida." />
  </View>
);

const RecetasTab = () => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>RECETAS</KlinoText>
      <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
    </View>
    <RecordItem date="14 de agosto" status="OK" desc="Losartán 50 mg · Metformina 850 mg · 30 días" />
    <RecordItem date="2 de julio" status="OK" desc="Losartán 50 mg · 30 días" />
  </View>
);

const RecordItem = ({ date, status, desc }: any) => (
  <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18 }}>{date}</KlinoText>
      {status === 'SIN APROBAR' ? (
        <View style={{ backgroundColor: KLINO_COLORS.ambar, paddingHorizontal: 12, paddingVertical: 4 }}>
          <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold' }}>SIN APROBAR</KlinoText>
        </View>
      ) : status === 'OK' ? (
        <KlinoText variant="body" color={KLINO_COLORS.verde}>✓</KlinoText>
      ) : (
        <KlinoText variant="small" color={KLINO_COLORS.gris}>{status}</KlinoText>
      )}
    </View>
    <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24, fontSize: 18 }}>{desc}</KlinoText>
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>{title}</KlinoText>
);

const GridCell = ({ label, value, sub, isRight, isBottom }: any) => (
  <View style={{ width: '50%', padding: 16, borderRightWidth: isRight ? 0 : 1, borderBottomWidth: isBottom ? 0 : 1, borderColor: KLINO_COLORS.borderStrong }}>
    <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 1, marginBottom: 8 }}>{label}</KlinoText>
    <KlinoText variant="h2" style={{ fontSize: 28, marginBottom: 4 }}>{value}</KlinoText>
    <KlinoText variant="small" color={KLINO_COLORS.gris}>{sub}</KlinoText>
  </View>
);

const ListItem = ({ left, right }: { left: string, right: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
    <KlinoText variant="body" style={{ fontSize: 18 }}>{left}</KlinoText>
    <KlinoText variant="small" color={KLINO_COLORS.gris}>{right}</KlinoText>
  </View>
);

const BoxItem = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <View style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, borderBottomWidth: 0, padding: 16, backgroundColor: KLINO_COLORS.papel }}>
    <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{title}</KlinoText>
    <KlinoText variant="small" color={KLINO_COLORS.gris}>{subtitle}</KlinoText>
  </View>
);

const TextSection = ({ title, children }: any) => (
  <View style={{ marginBottom: 24 }}>
    <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 1, marginBottom: 8 }}>{title}</KlinoText>
    <KlinoText variant="body" style={{ fontSize: 18, lineHeight: 28 }}>{children}</KlinoText>
  </View>
);

const styles = StyleSheet.create({});
