/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CrimeStatDetail } from './CrimeStatDetail';
export type CrimeStatResponse = {
    region: string;
    year: number;
    last_updated?: (string | null);
    statistics: Array<CrimeStatDetail>;
};

