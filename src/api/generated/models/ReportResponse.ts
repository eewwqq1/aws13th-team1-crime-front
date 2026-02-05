/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportStatus } from './ReportStatus';
export type ReportResponse = {
    title: string;
    content: string;
    region_id: number;
    crime_type_id: number;
    id: number;
    user_id: number;
    status: ReportStatus;
    created_at: string;
    approved_at?: (string | null);
    rejected_at?: (string | null);
};

