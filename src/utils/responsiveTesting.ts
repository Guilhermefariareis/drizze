/**
 * Utilitários de teste para validação de responsividade
 * Este arquivo contém funções para testar e validar componentes responsivos
 */

import { Breakpoint, CUSTOM_BREAKPOINTS } from '@/styles/responsive.config';

/**
 * Configurações de teste responsivo
 */
export const TESTING_CONFIG = {
  // Viewports padrão para testes
  viewports: {
    mobile: {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    tablet: {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    desktop: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
    // Viewports adicionais para testes mais abrangentes
    mobileSmall: {
      width: 320,
      height: 568,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    mobileLarge: {
      width: 414,
      height: 896,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    tabletSmall: {
      width: 600,
      height: 800,
      deviceScaleFactor: 1.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    tabletLarge: {
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    laptop: {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
    desktopLarge: {
      width: 2560,
      height: 1440,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
  },
  
  // Configurações de performance
  performance: {
    maxLoadTime: 2000, // 2 segundos máximo para carregar
    maxInteractiveTime: 3000, // 3 segundos para ser interativo
    maxFirstPaint: 1000, // 1 segundo para primeiro paint
    maxFirstContentfulPaint: 1500, // 1.5 segundos para FCP
  },
  
  // Configurações de acessibilidade
  accessibility: {
    minContrastRatio: 4.5, // WCAG AA
    minTouchTarget: 44, // 44x44px para mobile
    maxLineLength: 75, // máximo de caracteres por linha
    minFontSize: 14, // tamanho mínimo da fonte
  },
  
  // Configurações de layout
  layout: {
    maxContentWidth: 1200, // largura máxima do conteúdo
    minContentPadding: 16, // padding mínimo do conteúdo
    maxGridGap: 24, // gap máximo do grid
    minTapTarget: 48, // alvo mínimo para toque
  },
} as const;

/**
 * Tipos de teste responsivo
 */
export type ResponsiveTestType = 
  | 'layout'
  | 'typography'
  | 'spacing'
  | 'navigation'
  | 'forms'
  | 'images'
  | 'performance'
  | 'accessibility'
  | 'cross-browser';

/**
 * Resultado de um teste responsivo
 */
export interface ResponsiveTestResult {
  type: ResponsiveTestType;
  breakpoint: Breakpoint;
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: number;
}

/**
 * Interface para testador responsivo
 */
export interface ResponsiveTester {
  testLayout(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testTypography(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testSpacing(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testNavigation(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testForms(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testImages(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testPerformance(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testAccessibility(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  testCrossBrowser(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
}

/**
 * Classe base para testes responsivos
 */
export abstract class BaseResponsiveTester implements ResponsiveTester {
  protected viewport: any;
  protected page: any;

  constructor(viewport: any, page: any) {
    this.viewport = viewport;
    this.page = page;
  }

  abstract testLayout(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testTypography(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testSpacing(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testNavigation(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testForms(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testImages(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testPerformance(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testAccessibility(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;
  abstract testCrossBrowser(breakpoint: Breakpoint): Promise<ResponsiveTestResult>;

  /**
   * Configura o viewport para testes
   */
  protected async setViewport(breakpoint: Breakpoint): Promise<void> {
    const viewport = TESTING_CONFIG.viewports[breakpoint];
    await this.page.setViewport(viewport);
  }

  /**
   * Aguarda o carregamento completo da página
   */
  protected async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Captura uma screenshot para análise visual
   */
  protected async captureScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ 
      fullPage: true,
      path: `screenshots/${name}-${Date.now()}.png` 
    });
  }

  /**
   * Executa uma auditoria de performance
   */
  protected async auditPerformance(): Promise<any> {
    // Implementação básica - pode ser estendida com Lighthouse ou similar
    const metrics = await this.page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    return metrics;
  }

  /**
   * Verifica acessibilidade básica
   */
  protected async checkAccessibility(): Promise<any> {
    // Implementação básica - pode ser estendida com axe-core ou similar
    const issues = await this.page.evaluate(() => {
      const issues = [];
      
      // Verificar alt text em imagens
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt) {
          issues.push(`Image missing alt text: ${img.src}`);
        }
      });
      
      // Verificar labels em formulários
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (!input.id || !document.querySelector(`label[for="${input.id}"]`)) {
          issues.push(`Input missing label: ${input.type || input.tagName}`);
        }
      });
      
      // Verificar contraste mínimo
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        // Simplificado - em produção usar biblioteca de contraste
        if (color === bgColor) {
          issues.push(`Poor contrast: ${el.tagName}`);
        }
      });
      
      return issues;
    });
    
    return issues;
  }

  /**
   * Verifica layout responsivo
   */
  protected async checkLayout(): Promise<any> {
    const layout = await this.page.evaluate(() => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      
      const body = document.body;
      const scrollWidth = body.scrollWidth;
      const scrollHeight = body.scrollHeight;
      
      // Verificar overflow horizontal
      const hasHorizontalOverflow = scrollWidth > viewport.width;
      
      // Verificar elementos fora do viewport
      const elements = Array.from(document.querySelectorAll('*'));
      const offscreenElements = elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.right < 0 || rect.left > viewport.width;
      });
      
      return {
        viewport,
        scrollDimensions: { width: scrollWidth, height: scrollHeight },
        hasHorizontalOverflow,
        offscreenElements: offscreenElements.length,
        totalElements: elements.length,
      };
    });
    
    return layout;
  }
}

/**
 * Testador de layout responsivo
 */
export class LayoutResponsiveTester extends BaseResponsiveTester {
  async testLayout(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const layout = await this.checkLayout();
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (layout.hasHorizontalOverflow) {
      issues.push('Horizontal overflow detected');
      recommendations.push('Check for elements with fixed widths or margins');
    }
    
    if (layout.offscreenElements > 0) {
      warnings.push(`${layout.offscreenElements} elements are off-screen`);
      recommendations.push('Review positioning and overflow settings');
    }
    
    const score = Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10));
    
    return {
      type: 'layout',
      breakpoint,
      passed: score >= 80,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testTypography(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const typography = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const fontSizes = [];
      const lineHeights = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        fontSizes.push(parseInt(style.fontSize));
        lineHeights.push(parseFloat(style.lineHeight));
      });
      
      return {
        minFontSize: Math.min(...fontSizes),
        maxFontSize: Math.max(...fontSizes),
        avgFontSize: fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length,
        minLineHeight: Math.min(...lineHeights),
        maxLineHeight: Math.max(...lineHeights),
        avgLineHeight: lineHeights.reduce((a, b) => a + b, 0) / lineHeights.length,
      };
    });
    
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (typography.minFontSize < TESTING_CONFIG.accessibility.minFontSize) {
      issues.push(`Font size too small: ${typography.minFontSize}px`);
      recommendations.push('Increase minimum font size to 14px');
    }
    
    if (typography.minLineHeight < 1.2) {
      warnings.push('Line height too small');
      recommendations.push('Increase line height for better readability');
    }
    
    const score = Math.max(0, 100 - (issues.length * 25) - (warnings.length * 10));
    
    return {
      type: 'typography',
      breakpoint,
      passed: score >= 85,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testSpacing(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const spacing = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const margins = [];
      const paddings = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        margins.push(parseInt(style.margin));
        paddings.push(parseInt(style.padding));
      });
      
      return {
        minMargin: Math.min(...margins),
        maxMargin: Math.max(...margins),
        avgMargin: margins.reduce((a, b) => a + b, 0) / margins.length,
        minPadding: Math.min(...paddings),
        maxPadding: Math.max(...paddings),
        avgPadding: paddings.reduce((a, b) => a + b, 0) / paddings.length,
      };
    });
    
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (spacing.minPadding < 8) {
      warnings.push('Padding too small in some elements');
      recommendations.push('Consider increasing padding for better touch targets');
    }
    
    if (spacing.minMargin < 4) {
      warnings.push('Margins too small in some elements');
      recommendations.push('Consider increasing margins for better spacing');
    }
    
    const score = Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5));
    
    return {
      type: 'spacing',
      breakpoint,
      passed: score >= 80,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testNavigation(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const navigation = await this.page.evaluate(() => {
      const navElements = Array.from(document.querySelectorAll('nav, .nav, .navigation, .menu'));
      const links = Array.from(document.querySelectorAll('a, button'));
      
      return {
        hasNavigation: navElements.length > 0,
        navElements: navElements.length,
        totalLinks: links.length,
        visibleLinks: links.filter(link => {
          const rect = link.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length,
      };
    });
    
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (!navigation.hasNavigation) {
      warnings.push('No navigation elements found');
      recommendations.push('Consider adding navigation elements for better UX');
    }
    
    if (navigation.visibleLinks === 0) {
      issues.push('No visible navigation links');
      recommendations.push('Check navigation visibility and styling');
    }
    
    const score = Math.max(0, 100 - (issues.length * 25) - (warnings.length * 10));
    
    return {
      type: 'navigation',
      breakpoint,
      passed: score >= 75,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testForms(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const forms = await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      
      return {
        totalInputs: inputs.length,
        labeledInputs: inputs.filter(input => {
          return input.id && document.querySelector(`label[for="${input.id}"]`);
        }).length,
        totalButtons: buttons.length,
        visibleButtons: buttons.filter(button => {
          const rect = button.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length,
      };
    });
    
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (forms.totalInputs > 0 && forms.labeledInputs < forms.totalInputs) {
      warnings.push(`Only ${forms.labeledInputs}/${forms.totalInputs} inputs have labels`);
      recommendations.push('Add labels to all form inputs for accessibility');
    }
    
    if (forms.visibleButtons === 0 && forms.totalButtons > 0) {
      issues.push('Form buttons are not visible');
      recommendations.push('Check button styling and positioning');
    }
    
    const score = Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10));
    
    return {
      type: 'forms',
      breakpoint,
      passed: score >= 80,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testImages(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const images = await this.page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      
      return {
        totalImages: imgs.length,
        imagesWithAlt: imgs.filter(img => img.alt).length,
        imagesWithTitle: imgs.filter(img => img.title).length,
        lazyLoadedImages: imgs.filter(img => img.loading === 'lazy').length,
      };
    });
    
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (images.totalImages > 0 && images.imagesWithAlt < images.totalImages) {
      warnings.push(`Only ${images.imagesWithAlt}/${images.totalImages} images have alt text`);
      recommendations.push('Add alt text to all images for accessibility');
    }
    
    if (images.lazyLoadedImages < images.totalImages) {
      recommendations.push('Consider adding lazy loading to images for better performance');
    }
    
    const score = Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10));
    
    return {
      type: 'images',
      breakpoint,
      passed: score >= 85,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testPerformance(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const performance = await this.auditPerformance();
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (performance.loadTime > TESTING_CONFIG.performance.maxLoadTime) {
      issues.push(`Load time too high: ${performance.loadTime}ms`);
      recommendations.push('Optimize assets and reduce load time');
    }
    
    if (performance.firstContentfulPaint > TESTING_CONFIG.performance.maxFirstContentfulPaint) {
      warnings.push(`FCP too high: ${performance.firstContentfulPaint}ms`);
      recommendations.push('Optimize critical rendering path');
    }
    
    const score = Math.max(0, 100 - (issues.length * 30) - (warnings.length * 15));
    
    return {
      type: 'performance',
      breakpoint,
      passed: score >= 85,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testAccessibility(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    await this.setViewport(breakpoint);
    await this.waitForLoad();
    
    const accessibility = await this.checkAccessibility();
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    if (accessibility.length > 0) {
      issues.push(`${accessibility.length} accessibility issues found`);
      recommendations.push('Fix accessibility issues for better inclusivity');
    }
    
    const score = Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10));
    
    return {
      type: 'accessibility',
      breakpoint,
      passed: score >= 90,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }

  async testCrossBrowser(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    // Implementação simplificada - em produção, testar em múltiplos navegadores reais
    const issues = [];
    const warnings = [];
    const recommendations = [];
    
    // Verificar compatibilidade de features CSS
    const cssCompatibility = await this.page.evaluate(() => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      // Testar flexbox
      testElement.style.display = 'flex';
      const hasFlexbox = testElement.style.display === 'flex';
      
      // Testar grid
      testElement.style.display = 'grid';
      const hasGrid = testElement.style.display === 'grid';
      
      // Testar CSS custom properties
      testElement.style.setProperty('--test', 'value');
      const hasCustomProperties = testElement.style.getPropertyValue('--test') === 'value';
      
      document.body.removeChild(testElement);
      
      return { hasFlexbox, hasGrid, hasCustomProperties };
    });
    
    if (!cssCompatibility.hasFlexbox) {
      issues.push('Flexbox not supported');
    }
    
    if (!cssCompatibility.hasGrid) {
      warnings.push('CSS Grid not supported');
    }
    
    const score = Math.max(0, 100 - (issues.length * 25) - (warnings.length * 10));
    
    return {
      type: 'cross-browser',
      breakpoint,
      passed: score >= 80,
      score,
      issues,
      warnings,
      recommendations,
      timestamp: Date.now(),
    };
  }
}

/**
 * Executa todos os testes responsivos para um breakpoint
 */
export async function runResponsiveTests(
  page: any,
  breakpoint: Breakpoint
): Promise<ResponsiveTestResult[]> {
  const viewport = TESTING_CONFIG.viewports[breakpoint];
  const tester = new LayoutResponsiveTester(viewport, page);
  
  const tests = [
    tester.testLayout(breakpoint),
    tester.testTypography(breakpoint),
    tester.testSpacing(breakpoint),
    tester.testNavigation(breakpoint),
    tester.testForms(breakpoint),
    tester.testImages(breakpoint),
    tester.testPerformance(breakpoint),
    tester.testAccessibility(breakpoint),
    tester.testCrossBrowser(breakpoint),
  ];
  
  return Promise.all(tests);
}

/**
 * Gera um relatório de testes responsivos
 */
export function generateTestReport(results: ResponsiveTestResult[]): string {
  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
  };
  
  let report = `
# Responsive Test Report

## Summary
- Total Tests: ${summary.total}
- Passed: ${summary.passed}
- Failed: ${summary.failed}
- Issues: ${summary.totalIssues}
- Warnings: ${summary.totalWarnings}
- Average Score: ${summary.averageScore.toFixed(1)}/100

## Detailed Results
`;
  
  results.forEach(result => {
    report += `
### ${result.type} (${result.breakpoint})
- Score: ${result.score}/100
- Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
`;
    
    if (result.issues.length > 0) {
      report += `- Issues:\n${result.issues.map(issue => `  - ${issue}`).join('\n')}\n`;
    }
    
    if (result.warnings.length > 0) {
      report += `- Warnings:\n${result.warnings.map(warning => `  - ${warning}`).join('\n')}\n`;
    }
    
    if (result.recommendations.length > 0) {
      report += `- Recommendations:\n${result.recommendations.map(rec => `  - ${rec}`).join('\n')}\n`;
    }
  });
  
  return report;
}

/**
 * Função auxiliar para simular diferentes dispositivos
 */
export function simulateDevice(device: keyof typeof TESTING_CONFIG.viewports): any {
  return TESTING_CONFIG.viewports[device];
}

/**
 * Função para verificar se um componente é responsivo
 */
export function isResponsive(
  element: HTMLElement,
  breakpoint: Breakpoint
): boolean {
  const rect = element.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  
  // Verificar se o elemento está dentro do viewport
  const isInViewport = rect.left >= 0 && 
                      rect.right <= viewport.width &&
                      rect.top >= 0 && 
                      rect.bottom <= viewport.height;
  
  // Verificar se o elemento tem largura adequada
  const minWidth = breakpoint === 'mobile' ? 280 : breakpoint === 'tablet' ? 600 : 800;
  const hasAdequateWidth = rect.width >= minWidth || rect.width <= viewport.width;
  
  return isInViewport && hasAdequateWidth;
}

/**
 * Função para calcular a pontuação de responsividade
 */
export function calculateResponsivenessScore(results: ResponsiveTestResult[]): number {
  if (results.length === 0) return 0;
  
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const averageScore = totalScore / results.length;
  
  // Penalizar por issues e warnings
  const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
  const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);
  
  const penalty = (totalIssues * 5) + (totalWarnings * 2);
  const finalScore = Math.max(0, averageScore - penalty);
  
  return Math.round(finalScore);
}