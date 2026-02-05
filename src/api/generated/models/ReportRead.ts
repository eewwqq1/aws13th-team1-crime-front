/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CrimeTypeSimple } from './CrimeTypeSimple';
import type { RegionSimple } from './RegionSimple';
export type ReportRead = {
    id: number;
    title: string;
    content: string;
    region: RegionSimple;
    crime_type: CrimeTypeSimple;
    user_id: number;
    created_at: string;
};

