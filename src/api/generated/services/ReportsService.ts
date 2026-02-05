/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportCreate } from '../models/ReportCreate';
import type { ReportPatch } from '../models/ReportPatch';
import type { ReportRead } from '../models/ReportRead';
import type { ReportUpdate } from '../models/ReportUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Get Reports
     * @param regionId
     * @param crimeTypeId
     * @param skip
     * @param limit
     * @param keyword 검색 키워드(제목/내용)
     * @param sortBy 정렬 기준: latest(최신순), oldest(오래된순)
     * @returns ReportRead Successful Response
     * @throws ApiError
     */
    public static getReportsApiGet(
        regionId?: (number | null),
        crimeTypeId?: (number | null),
        skip?: number,
        limit: number = 10,
        keyword?: (string | null),
        sortBy: string = 'latest',
    ): CancelablePromise<Array<ReportRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api',
            query: {
                'region_id': regionId,
                'crime_type_id': crimeTypeId,
                'skip': skip,
                'limit': limit,
                'keyword': keyword,
                'sort_by': sortBy,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Report
     * @param requestBody
     * @returns ReportRead Successful Response
     * @throws ApiError
     */
    public static createReportApiPost(
        requestBody: ReportCreate,
    ): CancelablePromise<ReportRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Report
     * @param reportId
     * @returns ReportRead Successful Response
     * @throws ApiError
     */
    public static getReportApiReportsReportIdGet(
        reportId: number,
    ): CancelablePromise<ReportRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reports/{report_id}',
            path: {
                'report_id': reportId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Report
     * @param reportId
     * @param requestBody
     * @returns ReportRead Successful Response
     * @throws ApiError
     */
    public static updateReportApiReportIdPut(
        reportId: number,
        requestBody: ReportUpdate,
    ): CancelablePromise<ReportRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/{report_id}',
            path: {
                'report_id': reportId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Patch Report
     * @param reportId
     * @param requestBody
     * @returns ReportRead Successful Response
     * @throws ApiError
     */
    public static patchReportApiReportIdPatch(
        reportId: number,
        requestBody: ReportPatch,
    ): CancelablePromise<ReportRead> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/{report_id}',
            path: {
                'report_id': reportId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Report
     * @param reportId
     * @returns void
     * @throws ApiError
     */
    public static deleteReportApiReportIdDelete(
        reportId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/{report_id}',
            path: {
                'report_id': reportId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
