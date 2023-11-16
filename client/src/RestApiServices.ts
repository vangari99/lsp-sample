/* eslint-disable no-mixed-spaces-and-tabs */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";


export interface GetResponse {
    success: boolean;
    data?: AxiosResponse;   //successful api response
    error?: AxiosError;     //error api response
}

export interface PutResponse {
    success: boolean;
    data?: AxiosResponse;   //successful api response
    error?: AxiosError;     //error api response
}

export class RestApiServices {

    private static instance: RestApiServices;
    private constructor() {
        // This is a singleton class
    }

    /**
    * The static method controls the access to the RestApiServices instance.
    * Creates and returns object of the classs
    */
    public static getInstance(): RestApiServices {
        if (!RestApiServices.instance) {
            RestApiServices.instance = new RestApiServices();
        }
        return RestApiServices.instance;
    }

    /**
     * process https get request.
     * @param hostname - host name of the application
     * @param request  - uri of the request
     * @param config   - http config parameters
     * @returns        - GetResponse
     */
    // public async getRequest(hostname: string, request: string, config: AxiosRequestConfig): Promise<(any | null)> {
    //     if(request.includes("#")){
    //         const re = /\#/gi;
    //         request =request.replace(re,'%23');
    //     }
    //     const url = `https://${hostname}/${request}`;
    //     config.headers = {
    //         'content-type': 'application/json',
    //         // eslint-disable-next-line @typescript-eslint/naming-convention
    //         'X-CSRF-ZOSMF-HEADER': 'true'            
    //     };
    //     const result: GetResponse = {
    //         success: true
    //     };
    //     //result.success = true;
    //     try {
    //         const response = await axios.get(encodeURI(url), config);
    //         //result = response.data;
    //         result.data = response.data;
    //         // zoweLogger.logImperativeMessage(`axios.get('${request}') request was successful with status ${response.status}`, MessageSeverityEnum.INFO);
    //     } catch (error) {
    //         result.success = false;
    //         // if (error instanceof Axios){
    //         // result.error = error;
    //         // }
    //     }
    //     return result;
    // }

    /**
     * process https post request
     * @param hostname - host name of the application
     * @param request  - uri of the request   
     * @param body     - http Request body 
     * @param config   - http config parameters 
     * @returns        - http response/null
     */
    public async putRequest(hostname: string, request: string, body: any, config: AxiosRequestConfig): Promise<(any | null)> {
        const url = `https://${hostname}/${request}`;
        if (typeof body === "string") {
            config.headers = {
                'content-type': 'text/plain; charset=UTF-8',
                // eslint-disable-next-line @typescript-eslint/naming-convention
	            'X-CSRF-ZOSMF-HEADER': 'true'
            };
        } else {
            config.headers = {
                'content-type': 'application/json',
                // eslint-disable-next-line @typescript-eslint/naming-convention
	            'X-CSRF-ZOSMF-HEADER': 'true'                
            };
        }
        const result: PutResponse = {
            success: true
        };
        try {
            const response = await axios.put(url, body as string, config);
            if (response.status < 400) {
                result.data = response.data;
                console.log(`axios.put('${request}') request was successful with status ${response.status}`);
            }
        } catch (error) {
            result.success = false;
            result.data = error;
            if (error instanceof Error) {
                console.log(error.message);
            }
        }
        return result;
    }

    /**
     * process https post request
     * @param hostname - host name of the application  
     * @param request  - uri of the request 
     * @param body     - http Request body 
     * @param config   - http config parameters 
     * @returns        - http response/null
     */
    public async postRequest(hostname: string, request: string, body: any, config: AxiosRequestConfig): Promise<(any | null)> {
        const url = `https://${hostname}/${request}`;
        config.headers = {
            'content-type': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'X-CSRF-ZOSMF-HEADER': 'true'            
        };
        let result:any;
        try {
            const response = await axios.post(url, body, config);
            if (response.status < 400) {
                result = response.data;
            }
        } catch (error) {
            result = error;
        }
        return result;
    }

    /**
     * process https delete request
     * @param hostname - host name of the application 
     * @param request  - uri of the request  
     * @param config   - http config parameters 
     * @returns        - http response/null
     */
    public async deleteRequest(hostname: string, request: string, config: AxiosRequestConfig): Promise<(any | null)> {
        const url = `https://${hostname}/${request}`;
        let result: any;
        config.headers = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'X-CSRF-ZOSMF-HEADER': 'true'            
        };
        try {
            const response = await axios.delete(encodeURI(url), config);
            result = response;
            // zoweLogger.logImperativeMessage(`axios.delete('${request}') request was successful with status ${response.status}`, MessageSeverityEnum.INFO);
        } catch (error) {
            result = error;
        }        
        return result;
    }

}