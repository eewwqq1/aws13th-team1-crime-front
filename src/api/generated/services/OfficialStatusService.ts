/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CrimeStatResponse } from '../models/CrimeStatResponse';
import type { OfficialStatRead } from '../models/OfficialStatRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OfficialStatusService {
    /**
     * Get Stats
     * @param province
     * @param city
     * @param major
     * @param minor
     * @param year
     * @returns CrimeStatResponse Successful Response
     * @throws ApiError
     */
    public static getStatsApiStatusGet(
        province: string,
        city?: string,
        major?: string,
        minor?: string,
        year?: number,
    ): CancelablePromise<CrimeStatResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/status',
            query: {
                'province': province,
                'city': city,
                'major': major,
                'minor': minor,
                'year': year,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Official Stats
     * @param regionId
     * @param crimeTypeId
     * @param year
     * @returns OfficialStatRead Successful Response
     * @throws ApiError
     */
    public static getOfficialStatsApiStatusAllGet(
        regionId?: (number | null),
        crimeTypeId?: (number | null),
        year?: (number | null),
    ): CancelablePromise<Array<OfficialStatRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/statusAll',
            query: {
                'region_id': regionId,
                'crime_type_id': crimeTypeId,
                'year': year,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
