/**
 * Created by abouslimi on 3/1/21.
 */

@IsTest
public class OrderTestMock {
    public static final String TEST_ACCOUNT_NUMBER = 'TEST001';
    public static final Integer TEST_GENERATED_PRODUCTS_COUNT = 300;
    public static void createOrderMockData() {
        // Create customer account
        Account account = new Account(
                Name = 'ORDER MANAGER TEST ACCOUNT',
                AccountNumber = TEST_ACCOUNT_NUMBER
        );
        insert account;
        // create contract
        Contract contract = new Contract(
                AccountId = account.Id,
                Status = 'Draft',
                StartDate = Date.today(),
                ContractTerm = 24
        );
        insert contract;
        contract.Status = 'Activated';
        update contract;
        // Create order
        Order order = new Order(
                ContractId = contract.Id,
                Status = 'Draft',
                AccountId = account.Id,
                EffectiveDate = Date.today(),
                Pricebook2Id = Test.getStandardPricebookId()
        );
        insert order;
        // create products
        List<Product2> products = new List<Product2>();
        for (Integer i = 0; i < TEST_GENERATED_PRODUCTS_COUNT; i++) {
            products.add(new Product2(
                    Name = 'Product Test N°' + i,
                    ProductCode = 'Product Code N°' + i,
                    IsActive = true
            ));
        }
        insert products;
        // create standard pricebook entries
        List<PricebookEntry> pricebookEntries = new List<PricebookEntry>();
        for (Product2 product : products) {
            pricebookEntries.add(
                    new PricebookEntry(
                        Pricebook2Id = Test.getStandardPricebookId(),
                        Product2Id = product.Id,
                        UnitPrice = Math.random() * 1000,
                        IsActive = true
                    )
            );
        }
        insert pricebookEntries;
        // create order items
        List<OrderItem> orderItems = new List<OrderItem>();
        for (PricebookEntry pricebookEntry: pricebookEntries) {
            if (pricebookEntry.UnitPrice>500) continue;
            orderItems.add(
                    new OrderItem(
                            OrderId = order.Id,
                            UnitPrice = pricebookEntry.UnitPrice,
                            Quantity = Math.round(Math.random() * 99) + 1,
                            Product2Id = pricebookEntry.Product2Id,
                            PricebookEntryId = pricebookEntry.Id
                    )
            );
        }
        insert orderItems;
    }
}