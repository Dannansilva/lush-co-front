'use client';

import { useState, useEffect } from 'react';

interface ScreenSize {
  width: number;
  height: number;
}

export function useScreenSize() {
  // Use consistent default values for SSR and initial client render to prevent hydration mismatch
  // Default to desktop size (1920x1080) as it's the most common and provides better initial UX
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: 1920,
    height: 1080,
  });

  useEffect(() => {
    function handleResize() {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Call handler right away so state gets updated with actual window size after mount
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Helper function to calculate responsive values based on screen width
export function getResponsiveSize(screenWidth: number, baseSize: number, scaleFactor: number = 1) {
  // Base reference: 375px (mobile) to 1920px (desktop)
  const minWidth = 375;
  const maxWidth = 1920;

  // Normalize screen width to a 0-1 scale
  const normalizedWidth = Math.min(Math.max((screenWidth - minWidth) / (maxWidth - minWidth), 0), 1);

  // Calculate size based on scale factor
  return baseSize + (baseSize * scaleFactor * normalizedWidth);
}

// Helper function to get responsive padding
export function getResponsivePadding(screenWidth: number, screenHeight: number) {
  return {
    horizontal: screenWidth * 0.05, // 5% of width
    vertical: screenHeight * 0.05,  // 5% of height
  };
}

// Helper function to get responsive font size
export function getResponsiveFontSize(screenWidth: number, minSize: number, maxSize: number) {
  const minWidth = 375;
  const maxWidth = 1920;

  const normalizedWidth = Math.min(Math.max((screenWidth - minWidth) / (maxWidth - minWidth), 0), 1);

  return minSize + (maxSize - minSize) * normalizedWidth;
}

// Helper function to get responsive margin
export function getResponsiveMargin(screenWidth: number, screenHeight: number, percentage: number = 0.03) {
  return {
    horizontal: Math.max(8, Math.min(screenWidth * percentage, 60)),
    vertical: Math.max(8, Math.min(screenHeight * percentage, 40)),
  };
}

// Helper function to get responsive gap/spacing
export function getResponsiveGap(screenWidth: number, minGap: number = 8, maxGap: number = 32) {
  const percentage = 0.02; // 2% of screen width
  return Math.max(minGap, Math.min(screenWidth * percentage, maxGap));
}

// Helper function to calculate responsive width
export function getResponsiveWidth(screenWidth: number, percentage: number, maxWidth?: number) {
  const calculatedWidth = screenWidth * (percentage / 100);
  return maxWidth ? Math.min(calculatedWidth, maxWidth) : calculatedWidth;
}

// Helper function to calculate responsive height
export function getResponsiveHeight(screenHeight: number, percentage: number, maxHeight?: number) {
  const calculatedHeight = screenHeight * (percentage / 100);
  return maxHeight ? Math.min(calculatedHeight, maxHeight) : calculatedHeight;
}

// Helper to check device type
export function getDeviceType(screenWidth: number) {
  if (screenWidth < 640) return 'mobile';
  if (screenWidth < 1024) return 'tablet';
  return 'desktop';
}

// Helper to get grid columns based on screen width
export function getGridColumns(screenWidth: number, mobileColumns: number = 1, tabletColumns: number = 2, desktopColumns: number = 3) {
  if (screenWidth < 640) return mobileColumns;
  if (screenWidth < 1024) return tabletColumns;
  return desktopColumns;
}

// Helper to calculate border radius responsive to screen
export function getResponsiveBorderRadius(screenWidth: number, minRadius: number = 8, maxRadius: number = 24) {
  const minWidth = 375;
  const maxWidth = 1920;
  const normalizedWidth = Math.min(Math.max((screenWidth - minWidth) / (maxWidth - minWidth), 0), 1);
  return minRadius + (maxRadius - minRadius) * normalizedWidth;
}

// Comprehensive function to get all common responsive values at once
export function getResponsiveValues(screenWidth: number, screenHeight: number) {
  return {
    // Padding - rounded to avoid hydration mismatch
    padding: {
      horizontal: Math.round(screenWidth * 0.05),
      vertical: Math.round(screenHeight * 0.05),
    },

    // Font sizes - rounded to avoid hydration mismatch
    fontSize: {
      heading: Math.round(getResponsiveFontSize(screenWidth, 24, 32)),
      subheading: Math.round(getResponsiveFontSize(screenWidth, 18, 24)),
      body: Math.round(getResponsiveFontSize(screenWidth, 14, 16)),
      label: Math.round(getResponsiveFontSize(screenWidth, 14, 14)),
      small: Math.round(getResponsiveFontSize(screenWidth, 12, 14)),
      caption: Math.round(getResponsiveFontSize(screenWidth, 10, 12)),
    },

    // Card/Container - rounded to avoid hydration mismatch
    card: {
      padding: Math.round(Math.max(24, Math.min(screenWidth * 0.04, 40))),
      borderRadius: Math.round(getResponsiveBorderRadius(screenWidth, 12, 24)),
      maxWidth: Math.round(Math.min(screenWidth * 0.9, 600)),
    },

    // Spacing - rounded to avoid hydration mismatch
    spacing: {
      vertical: Math.round(Math.max(20, Math.min(screenHeight * 0.025, 24))),
      horizontal: Math.round(Math.max(16, Math.min(screenWidth * 0.025, 32))),
      gap: Math.round(Math.max(12, Math.min(screenWidth * 0.02, 24))),
    },

    // Margins - rounded to avoid hydration mismatch
    margin: {
      bottom: Math.round(Math.max(24, Math.min(screenHeight * 0.03, 32))),
      top: Math.round(Math.max(24, Math.min(screenHeight * 0.03, 32))),
      sides: Math.round(Math.max(16, Math.min(screenWidth * 0.04, 48))),
    },

    // Device info
    device: {
      type: getDeviceType(screenWidth),
      isMobile: screenWidth < 640,
      isTablet: screenWidth >= 640 && screenWidth < 1024,
      isDesktop: screenWidth >= 1024,
      columns: getGridColumns(screenWidth, 1, 2, 3),
    },
  };
}
