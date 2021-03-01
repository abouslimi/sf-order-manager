/**
 * Created by abouslimi on 2/27/21.
 * @description Controller class of LWC Component (OrderProducts)
 */

public with sharing class AvailableProductsController {
    /**
     * @description
     * Get Entries of Order's PriceBook
     * @param orderId
     * @param intOffset
     *
     * @return List of Pricebook Entries
     */
    @AuraEnabled(Cacheable=true)
    public static Object getPricebookEntriesByOrderId(Id orderId, Integer intOffset) {
        List<PricebookEntry> pricebookEntries = PricebookController.getPricebookEntriesByOrderId(orderId, intOffset);
        List<PricebookEntryWrapper> pricebookEntryWrappers = new List<PricebookEntryWrapper>();
        for (PricebookEntry pricebookEntry : pricebookEntries) {
            pricebookEntryWrappers.add(
                    new PricebookEntryWrapper(pricebookEntry)
            );
        }
        pricebookEntryWrappers.sort();
        return JSONSerializer.serialize(pricebookEntryWrappers);
    }
}
