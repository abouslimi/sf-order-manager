/**
 * Created by abouslimi on 2/27/21.
 */

public with sharing class PricebookController {
    /**
     * @description
     * Get PriceBook Entries of Order's PriceBook
     * @param orderId
     *
     * @return List<PricebookEntry>
     */
    public static List<PricebookEntry> getPricebookEntriesByOrderId(Id orderId) {
        return PricebookRepository.getPricebookEntriesByOrderId(orderId);
    }
}