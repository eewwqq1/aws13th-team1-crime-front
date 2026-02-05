/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OfficialStatRead } from '../models/OfficialStatRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OfficialStatsService {
    /**
     * Get Official Stats
     * @param regionId
     * @param crimeTypeId
     * @param year
     * @returns OfficialStatRead Successful Response
     * @throws ApiError
     */
    public static getOfficialStatsApiOfficialStatsGet(
        regionId?: (number | null),
        crimeTypeId?: (number | null),
        year?: (number | null),
    ): CancelablePromise<Array<OfficialStatRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/official-stats/',
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
