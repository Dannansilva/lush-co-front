'use client';

import { useState, useEffect } from 'react';

interface ScreenSize {
  width: number;
  height: number;
}

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

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
    // Padding
    padding: {
      horizontal: screenWidth * 0.05,
      vertical: screenHeight * 0.05,
    },

    // Font sizes
    fontSize: {
      heading: getResponsiveFontSize(screenWidth, 24, 32),
      subheading: getResponsiveFontSize(screenWidth, 18, 24),
      body: getResponsiveFontSize(screenWidth, 14, 16),
      label: getResponsiveFontSize(screenWidth, 14, 14),
      small: getResponsiveFontSize(screenWidth, 12, 14),
      caption: getResponsiveFontSize(screenWidth, 10, 12),
    },

    // Card/Container
    card: {
      padding: Math.max(24, Math.min(screenWidth * 0.04, 40)),
      borderRadius: getResponsiveBorderRadius(screenWidth, 12, 24),
      maxWidth: Math.min(screenWidth * 0.9, 600),
    },

    // Spacing
    spacing: {
      vertical: Math.max(20, Math.min(screenHeight * 0.025, 24)),
      horizontal: Math.max(16, Math.min(screenWidth * 0.025, 32)),
      gap: Math.max(12, Math.min(screenWidth * 0.02, 24)),
    },

    // Margins
    margin: {
      bottom: Math.max(24, Math.min(screenHeight * 0.03, 32)),
      top: Math.max(24, Math.min(screenHeight * 0.03, 32)),
      sides: Math.max(16, Math.min(screenWidth * 0.04, 48)),
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
