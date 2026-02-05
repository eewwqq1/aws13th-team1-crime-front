/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CrimeTypeSimple } from './CrimeTypeSimple';
import type { RegionSimple } from './RegionSimple';
export type OfficialStatRead = {
    region_id: number;
    crime_type_id: number;
    count: number;
    year: number;
    id: number;
    region: RegionSimple;
    crime_type: CrimeTypeSimple;
};

