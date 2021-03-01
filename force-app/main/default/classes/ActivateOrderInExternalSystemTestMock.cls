/**
 * Created by abouslimi on 3/1/21.
 */

@IsTest
public class ActivateOrderInExternalSystemTestMock implements HttpCalloutMock {

    public HttpResponse respond(HttpRequest request) {
        HttpResponse response = new HttpResponse();
        response.setHeader('Content-Type', 'application/json');
        response.setStatusCode(200);
        response.setBody('{}');
        return response;
    }
}