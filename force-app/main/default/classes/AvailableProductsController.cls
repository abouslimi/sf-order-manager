/**
 * Created by abouslimi on 2/27/21.
 * @description Controller class of LWC Component (OrderProducts)
 */

public with sharing class AvailableProductsController {
    /**
     * @description
     * Get Entries of Order's PriceBook
     * @param orderId
     *
     * @return List of Pricebook Entries
     */
    @AuraEnabled(Cacheable=true)
    public static List<PricebookEntryWrapper> getPricebookEntriesByOrderId(Id orderId) {
        List<PricebookEntry> pricebookEntries = PricebookController.getPricebookEntriesByOrderId(orderId);
        List<PricebookEntryWrapper> pricebookEntryWrappers = new List<PricebookEntryWrapper>();
        for (PricebookEntry pricebookEntry : pricebookEntries) {
            pricebookEntryWrappers.add(
                    new PricebookEntryWrapper(pricebookEntry)
            );
        }
        pricebookEntryWrappers.sort();
        return pricebookEntryWrappers;
    }
}
