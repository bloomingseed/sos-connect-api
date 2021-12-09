/**
 * @swagger
 * components:
 *  schemas:
 *    "Response Error":
 *      description: Common error. See response body for details.
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *      example:
 *        error: Error message
 *    "Response Error Unauthorized":
 *      description: Failed to authorize request.
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *      example:
 *        error: Request header "Authentication" does not exist or does not contain authentication token.
 */
