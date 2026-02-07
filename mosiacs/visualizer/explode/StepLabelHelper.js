/**
 * StepLabelHelper - Provides label text and color mappings for code steps.
 *
 * Extracted from ExplodeManager so helpers stay small and testable.
 */
class StepLabelHelper {

    /**
     * Return a human-readable label for a parsed trace step.
     */
    static labelForStep(step) {
        switch (step.type) {
            case 'DECL':
                return `DECL  ${step.name} = ${step.value}`;
            case 'ASSIGN':
                return `${step.name} = ${step.value}`;
            case 'LOOP':
                return `LOOP  ${step.name}  iter ${step.value}`;
            case 'IF':
                return `IF  ${step.name}  (${step.value})`;
            case 'ELSE':
                return `ELSE`;
            case 'RETURN':
                return `RETURN  ${step.value}`;
            case 'CALL':
                return `CALL  ${step.name}`;
            default:
                return `${step.type}  ${step.name || ''} ${step.value || ''}`;
        }
    }

    /**
     * Return an RGBA colour object for a given child step type.
     */
    static colorForChild(step) {
        const map = {
            'DECL':   { r: 0.2, g: 0.4, b: 0.8, a: 0.85 },
            'ASSIGN': { r: 0.2, g: 0.8, b: 0.4, a: 0.85 },
            'LOOP':   { r: 0.6, g: 0.2, b: 0.8, a: 0.85 },
            'IF':     { r: 0.9, g: 0.4, b: 0.2, a: 0.85 },
            'ELSE':   { r: 0.4, g: 0.7, b: 0.9, a: 0.85 },
            'RETURN': { r: 0.9, g: 0.7, b: 0.1, a: 0.85 },
            'CALL':   { r: 0.8, g: 0.2, b: 0.2, a: 0.85 }
        };
        return map[step.type] || { r: 0.6, g: 0.6, b: 0.6, a: 0.85 };
    }
}
