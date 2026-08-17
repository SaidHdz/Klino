import React, { useState } from 'react';
import { View, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { KlinoText } from './KlinoText';

interface Props {
  children: React.ReactNode;
  contentContainerStyle?: any;
  scrollRef?: React.RefObject<ScrollView>;
}

export const FadingScrollContainer: React.FC<Props> = ({ children, contentContainerStyle, scrollRef }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    
    setCanScrollLeft(contentOffset.x > 5);
    setCanScrollRight(contentOffset.x + layoutMeasurement.width < contentSize.width - 5);
  };

  return (
    <View style={{ position: 'relative' }}>
      <ScrollView 
        ref={scrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>

      {canScrollLeft && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center', backgroundColor: 'rgba(250, 248, 244, 0.8)', paddingHorizontal: 8 }}>
          <KlinoText variant="body" style={{ color: 'rgba(26, 74, 56, 0.7)', fontSize: 24 }}>‹</KlinoText>
        </View>
      )}

      {canScrollRight && (
        <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', backgroundColor: 'rgba(250, 248, 244, 0.8)', paddingHorizontal: 8 }}>
          <KlinoText variant="body" style={{ color: 'rgba(26, 74, 56, 0.7)', fontSize: 24 }}>›</KlinoText>
        </View>
      )}
    </View>
  );
};
