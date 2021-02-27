
/**
 * Created by abouslimi on 2/27/21.
 */

public class PricebookEntryWrapper implements Comparable {
    public PricebookEntry pricebookEntry;

    public PricebookEntryWrapper(PricebookEntry pricebookEntry) {
        this.pricebookEntry = pricebookEntry;
    }

    public Integer compareTo(Object compareTo) {
        if (pricebookEntry.OrderItems != null && !pricebookEntry.OrderItems.isEmpty()) {
            return -1;
        } else {
            return 1;
        }
    }
}