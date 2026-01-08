import { Pipe, PipeTransform } from '@angular/core';

type PopulationMode = 'short' | 'category';

@Pipe({
    name: 'population',
    standalone: true
})
export class PopulationPipe implements PipeTransform {
    transform(
        value: number | null | undefined,
        mode: PopulationMode = 'short'
    ): string {
        if (value === null || value === undefined || isNaN(value as any)) {
            return '';
        }

        if (mode === 'category') {
            return this.toCategory(value);
        }

        // default: short format
        return this.toShort(value);
    }

    private toShort(value: number): string {
        const abs = Math.abs(value);

        if (abs >= 1_000_000_000) {
            return this.format(value / 1_000_000_000) + 'B';
        }
        if (abs >= 1_000_000) {
            return this.format(value / 1_000_000) + 'M';
        }
        if (abs >= 1_000) {
            return this.format(value / 1_000) + 'K';
        }

        return value.toString();
    }

    private toCategory(value: number): string {
        if (value >= 4_000_000) {
            return '4 Million+';
        } else if (value >= 1_000_000) {
            return '1 Million - 4 Million';
        } else if (value >= 500_000) {
            return '500 Thousand - 1 Million';
        } else if (value >= 100_000) {
            return '100 Thousand - 500 Thousand';
        } else {
            return '< 100 Thousand';
        }
    }

    private format(num: number): string {
        return num.toFixed(1).replace(/\.0$/, '');
    }
}
