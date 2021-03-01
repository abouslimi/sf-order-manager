/**
 * Created by abouslimi on 2/27/21.
 */

public with sharing class PricebookController {
    /**
     * @description
     * Get PriceBook Entries of Order's PriceBook
     * @param orderId
     * @param intOffset
     *
     * @return List<PricebookEntry>
     */
    public static List<PricebookEntry> getPricebookEntriesByOrderId(Id orderId, Integer intOffset) {
        return PricebookRepository.getPricebookEntriesByOrderId(orderId, intOffset);
    }
}