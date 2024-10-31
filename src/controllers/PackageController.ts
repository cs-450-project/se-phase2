/** 
 * @file src/controllers/PackageController.ts
 * Controller processes requests, delegates logic to services, and returns the response.
 */

import { Request, Response } from 'express';

class PackageController {

    static async uploadPackage(req: Request, res: Response) {
        try {
        
            console.log('[PackageController] Request received:', req.body);

            const { Content, URL, JSProgram, debloat } = req.body;

            if (Content && !URL) {
                console.log('[PackageController] Request contains Content.');

                res.status(200).json({ 
                    message: 'Content package uploaded successfully.',
                    processedData: { Content, debloat, JSProgram },
                 });
                

            }

            else if (URL && !Content) {
                console.log('[PackageController] Request contains URL.');
                
                res.status(200).json({ 
                    message: 'URL package uploaded successfully.',
                    processedData: { URL, JSProgram },
                 });
                
            }

            else {

                console.log('[PackageController] Request does not contain Content or URL.');
                res.status(400).json({ message: 'There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)' });
                
            }
        

        } catch (error) {
            console.error('[PackageController] An error occurred while processing the request:', error);
            res.status(400).json({ message: 'Bad Request' });
            

        }
    }

}

export default PackageController;