/**
 * @fileoverview Warn when a plain <button> element is used instead of the
 * <Button> component, unless it uses one of the allowed non-button CSS
 * patterns (chip, tab, segment, energy selector, capture bar, toast undo,
 * card selector, or inline text link styles).
 *
 * Allowed CSS class patterns (matches className string):
 *  chip            — Chip component / selection pill
 *  tab-bar-item    — Tab navigation
 *  segment-control — Segmented control
 *  energy-btn      — Energy mode selector (Header)
 *  capture-bar-btn — Quick capture bar icon
 *  toast-undo      — Toast undo link
 *  card            — Card-style selection (Onboarding time blocks)
 *  task-card       — Task card container (not a button but uses className)
 *  btn             — Already a Button component usage (btn-* classes)
 */

'use strict';

const ALLOWED_PATTERNS = [
  /(^|[\s"'])chip(?=[\s"']|$)/,
  /(^|[\s"'])chip-active(?=[\s"']|$)/,
  /(^|[\s"'])tab-bar-item(?=[\s"']|$)/,
  /(^|[\s"'])segment-control-item(?=[\s"']|$)/,
  /(^|[\s"'])energy-btn(?=[\s"']|$)/,
  /(^|[\s"'])capture-bar-btn(?=[\s"']|$)/,
  /(^|[\s"'])toast-undo(?=[\s"']|$)/,
  /(^|[\s"'])card(?=[\s"']|$)/,
  /(^|[\s"'])card-interactive(?=[\s"']|$)/,
  /(^|[\s"'])btn(?=[\s"']|$)/,
  /(^|[\s"'])task-card-checkbox(?=[\s"']|$)/,
];

/**
 * Extract a flattened className string from a JSX className attribute value.
 * Handles string literals, template literals, and cn() call expressions.
 */
function extractClassName(attrValue) {
  if (!attrValue) return '';

  // className="chip active"
  if (attrValue.type === 'Literal') {
    return String(attrValue.value);
  }

  if (attrValue.type === 'JSXExpressionContainer') {
    const expr = attrValue.expression;

    // className={`chip ${cond && 'chip-active'}`}
    if (expr.type === 'TemplateLiteral') {
      return expr.quasis.map(q => q.value.raw).join(' ');
    }

    // className={cn('chip', active && 'chip-active')}
    if (expr.type === 'CallExpression') {
      return expr.arguments
        .filter(a => a.type === 'Literal')
        .map(a => String(a.value))
        .join(' ');
    }
  }

  return '';
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer <Button> component over plain <button> for action buttons',
      recommended: false,
    },
    messages: {
      preferButton:
        'Use the <Button> component instead of plain <button>. If this is intentionally a non-action-button pattern (chip, tab, segment, energy selector, etc.), add one of the allowed CSS classes to suppress this warning.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        // Only match <button> (not <Button>)
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'button') {
          return;
        }

        // Skip if this is the Button component's own <button> (Button.tsx)
        const filename = context.filename || context.getFilename?.() || '';
        if (filename.endsWith('/Button.tsx') || filename.endsWith('\\Button.tsx')) {
          return;
        }

        // Check for allowed CSS patterns in className attribute
        const classNameAttr = node.attributes.find(
          attr => attr.type === 'JSXAttribute' && attr.name.name === 'className',
        );

        if (classNameAttr) {
          const classNameValue = extractClassName(classNameAttr.value);
          if (classNameValue) {
            for (const pattern of ALLOWED_PATTERNS) {
              if (pattern.test(classNameValue)) {
                return; // Allowed pattern found
              }
            }
          }
        }

        // Check for inline styles (Auth.tsx toggle link styled as text)
        const styleAttr = node.attributes.find(
          attr => attr.type === 'JSXAttribute' && attr.name.name === 'style',
        );
        if (styleAttr) {
          // Has inline style — likely a styled text link. Allow it.
          return;
        }

        // Report plain <button> without allowed pattern
        context.report({
          node,
          messageId: 'preferButton',
        });
      },
    };
  },
};
