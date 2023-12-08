/**
 * Embed Google Tag Manager script
 */
(function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-XXXXXXX");

/**
 * Convert Shopify item to GA4 item
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout_item
 * @param item CheckoutLineItem
 * @param index Number
 * @returns GA4Item
 */
var shopifyCheckoutLineItemToGA4Item = function (item, index) {
    var data = {
        item_id: item.id,
        item_name: item.title,
        index: index,
        quantity: item.quantity,
        price: item.variant.price.amount,
        item_variant: item.variant.product.title,
        item_brand: item.variant.product.vendor,
    };

    var discountAllocations = item.discountAllocations || [];

    // Loop through discounts and extract titles
    (data.coupon = discountAllocations
        .map(function (discountAllocation) {
            return discountAllocation.discountApplication.title;
        })
        .join(",")),
        // Calculate discount total
        (data.discount = discountAllocations.reduce(function (
            total,
            discountAllocation
        ) {
            return total + discountAllocation.amount.amount;
        },
        0));

    return data;
};

/**
 * Convert a product variant to a Google item
 * @param variant ProductVariant
 * @returns GA4Item
 */
var productVariantToGA4Item = function(variant) {
    return {
        item_id: variant.product.id,
        item_name: variant.product.title,
        item_brand: variant.product.vendor,
        item_variant: variant.title,
        price: variant.price.amount,
    };
};

/**
 * Convert a Shopify collection to a list of GA4 items
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/collection_viewed
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_item_list_item
 * @param collection Collection
 * @return GA4Item[]
 */
var shopifyCollectionToGA4Items = function (collection) {
    return collection.productVariants.map(function (variant) {
        var item = productVariantToGA4Item(variant);

        // Add collection data
        item.item_list_id = collection.id;
        item.item_list_name = collection.title;

        return item;
    });
};

/**
 * Convert a Shopify cart line itme to a GA4 item
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/product_added_to_cart
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_to_cart_item
 * @param cartLine CartLine
 * @return GA4Item
 */
var shopifyCartLineToGA4Item = function(cartLine) {
  return {
    item_id: cartLine.merchandise.product.id,
    item_name: cartLine.merchandise.product.title,
    item_brand: cartLine.merchandise.product.vendor,
    item_variant: cartLine.merchandise.title,
    price: cartLine.cost.totalAmount.amount,
    quantity: cartLine.quantity,
  };
};

/**
 * Extract the titles of all applied discount codes
 * @param discountApplications DiscountApplication[]
 * @returns String
 */
var commaSeparatedDiscountTitles = function (discountApplications) {
    return discountApplications
        .map(function (discountApplications) {
            return discountApplications.title;
        })
        .join(",");
};

/**
 * Subscribe to events
 */
analytics.subscribe("checkout_completed", (event) => {
    window.dataLayer.push({
        event: "checkout_completed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: event.data.checkout.token,
        client_id: event.clientId,
        email: event.data.checkout.email,
        phone: event.data.checkout.phone,
        first_name: event.data.checkout.shippingAddress.firstName,
        last_name: event.data.checkout.shippingAddress.lastName,
        address1: event.data.checkout.shippingAddress.address1,
        address2: event.data.checkout.shippingAddress.address2,
        city: event.data.checkout.shippingAddress.city,
        country: event.data.checkout.shippingAddress.country,
        countryCode: event.data.checkout.shippingAddress.countryCode,
        province: event.data.checkout.shippingAddress.province,
        provinceCode: event.data.checkout.shippingAddress.provinceCode,
        zip: event.data.checkout.shippingAddress.zip,
        orderId: event.data.checkout.order.id,
        checkout_item_skus: event.data.checkout.lineItems.map(function(item) {
            return item.variant.sku;
        }).join(","),
        checkout_items: event.data.checkout.lineItems.map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            event.data.checkout.discountApplications
        ),
        currency: event.data.checkout.currencyCode,
        subtotal: event.data.checkout.subtotalPrice.amount,
        shipping: event.data.checkout.shippingLine.price.amount,
        value: event.data.checkout.totalPrice.amount,
        tax: event.data.checkout.totalTax.amount,
    });
});

analytics.subscribe("payment_info_submitted", (event) => {
    window.dataLayer.push({
        event: "payment_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: event.data.checkout.token,
        client_id: event.clientId,
        email: event.data.checkout.email,
        phone: event.data.checkout.phone,
        first_name: event.data.checkout.shippingAddress.firstName,
        last_name: event.data.checkout.shippingAddress.lastName,
        address1: event.data.checkout.shippingAddress.address1,
        address2: event.data.checkout.shippingAddress.address2,
        city: event.data.checkout.shippingAddress.city,
        country: event.data.checkout.shippingAddress.country,
        countryCode: event.data.checkout.shippingAddress.countryCode,
        province: event.data.checkout.shippingAddress.province,
        provinceCode: event.data.checkout.shippingAddress.provinceCode,
        zip: event.data.checkout.shippingAddress.zip,
        orderId: event.data.checkout.order.id,
        coupons: commaSeparatedDiscountTitles(
            event.data.checkout.discountApplications
        ),
        checkout_items: event.data.checkout.lineItems.map(
            shopifyCheckoutLineItemToGA4Item
        ),
        currency: event.data.checkout.currencyCode,
        subtotal: event.data.checkout.subtotalPrice.amount,
        shipping: event.data.checkout.shippingLine.price.amount,
        value: event.data.checkout.totalPrice.amount,
        tax: event.data.checkout.totalTax.amount,
    });
});

analytics.subscribe("checkout_shipping_info_submitted", (event) => {
    window.dataLayer.push({
        event: "checkout_shipping_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: event.data.checkout.token,
        client_id: event.clientId,
        email: event.data.checkout.email,
        phone: event.data.checkout.phone,
        first_name: event.data.checkout.shippingAddress.firstName,
        last_name: event.data.checkout.shippingAddress.lastName,
        address1: event.data.checkout.shippingAddress.address1,
        address2: event.data.checkout.shippingAddress.address2,
        city: event.data.checkout.shippingAddress.city,
        country: event.data.checkout.shippingAddress.country,
        countryCode: event.data.checkout.shippingAddress.countryCode,
        province: event.data.checkout.shippingAddress.province,
        provinceCode: event.data.checkout.shippingAddress.provinceCode,
        zip: event.data.checkout.shippingAddress.zip,
        orderId: event.data.checkout.order.id,
        checkout_items: event.data.checkout.lineItems.map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            event.data.checkout.discountApplications
        ),
        currency: event.data.checkout.currencyCode,
        subtotal: event.data.checkout.subtotalPrice.amount,
        shipping: event.data.checkout.shippingLine.price.amount,
        value: event.data.checkout.totalPrice.amount,
        tax: event.data.checkout.totalTax.amount,
    });
});

analytics.subscribe("checkout_address_info_submitted", (event) => {
    console.log({ event_name: "checkout_address_info_submitted", event });
    window.dataLayer.push({
        event: "checkout_address_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: event.data.checkout.token,
        client_id: event.clientId,
        email: event.data.checkout.email,
        phone: event.data.checkout.phone,
        first_name: event.data.checkout.shippingAddress.firstName,
        last_name: event.data.checkout.shippingAddress.lastName,
        address1: event.data.checkout.shippingAddress.address1,
        address2: event.data.checkout.shippingAddress.address2,
        city: event.data.checkout.shippingAddress.city,
        country: event.data.checkout.shippingAddress.country,
        countryCode: event.data.checkout.shippingAddress.countryCode,
        province: event.data.checkout.shippingAddress.province,
        provinceCode: event.data.checkout.shippingAddress.provinceCode,
        zip: event.data.checkout.shippingAddress.zip,
        orderId: event.data.checkout.order.id,
        checkout_items: event.data.checkout.lineItems.map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            event.data.checkout.discountApplications
        ),
        currency: event.data.checkout.currencyCode,
        subtotal: event.data.checkout.subtotalPrice.amount,
        shipping: event.data.checkout.shippingLine.price.amount,
        value: event.data.checkout.totalPrice.amount,
        tax: event.data.checkout.totalTax.amount,
    });
});

analytics.subscribe("checkout_contact_info_submitted", (event) => {
    window.dataLayer.push({
        event: "checkout_contact_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: event.data.checkout.token,
        client_id: event.clientId,
        email: event.data.checkout.email,
        phone: event.data.checkout.phone,
        first_name: event.data.checkout.shippingAddress.firstName,
        last_name: event.data.checkout.shippingAddress.lastName,
        address1: event.data.checkout.shippingAddress.address1,
        address2: event.data.checkout.shippingAddress.address2,
        city: event.data.checkout.shippingAddress.city,
        country: event.data.checkout.shippingAddress.country,
        countryCode: event.data.checkout.shippingAddress.countryCode,
        province: event.data.checkout.shippingAddress.province,
        provinceCode: event.data.checkout.shippingAddress.provinceCode,
        zip: event.data.checkout.shippingAddress.zip,
        orderId: event.data.checkout.order.id,
        checkout_items: event.data.checkout.lineItems.map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            event.data.checkout.discountApplications
        ),
        currency: event.data.checkout.currencyCode,
        subtotal: event.data.checkout.subtotalPrice.amount,
        shipping: event.data.checkout.shippingLine.price.amount,
        value: event.data.checkout.totalPrice.amount,
        tax: event.data.checkout.totalTax.amount,
    });
});

analytics.subscribe("checkout_started", (event) => {
    window.dataLayer.push({
        event: "checkout_started",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: event.data.checkout.token,
        client_id: event.clientId,
        email: event.data.checkout.email,
        phone: event.data.checkout.phone,
        first_name: event.data.checkout.shippingAddress.firstName,
        last_name: event.data.checkout.shippingAddress.lastName,
        address1: event.data.checkout.shippingAddress.address1,
        address2: event.data.checkout.shippingAddress.address2,
        city: event.data.checkout.shippingAddress.city,
        country: event.data.checkout.shippingAddress.country,
        countryCode: event.data.checkout.shippingAddress.countryCode,
        province: event.data.checkout.shippingAddress.province,
        provinceCode: event.data.checkout.shippingAddress.provinceCode,
        zip: event.data.checkout.shippingAddress.zip,
        orderId: event.data.checkout.order.id,
        checkout_items: event.data.checkout.lineItems.map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            event.data.checkout.discountApplications
        ),
        currency: event.data.checkout.currencyCode,
        subtotal: event.data.checkout.subtotalPrice.amount,
        shipping: event.data.checkout.shippingLine.price.amount,
        value: event.data.checkout.totalPrice.amount,
        tax: event.data.checkout.totalTax.amount,
    });
});

analytics.subscribe("product_added_to_cart", (event) => {
    window.dataLayer.push({
        event: "product_added_to_cart",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        price: event.data.cartLine.merchandise.price.amount,
        currency: event.data.cartLine.cost.totalAmount.currencyCode,
        total_cost: event.data.cartLine.cost.totalAmount.amount,
        product_title: event.data.cartLine.merchandise.product.title,
        quantity: event.data.cartLine.quantity,
        cart_items: [shopifyCartLineToGA4Item(event.data.cartLine)],
    });
});

analytics.subscribe("cart_viewed", (event) => {
    window.dataLayer.push({
        event: "cart_viewed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        currency: event.data.cart.cost.totalAmount.currencyCode,
        total_cost: event.data.cart.cost.totalAmount.amount,
        quantity: event.data.cart.totalQuantity,
        cart_id: event.data.cart.id,
        cart_items: event.data.cart.lines.map(shopifyCartLineToGA4Item),
    });
});

analytics.subscribe("page_viewed", (event) => {
    window.dataLayer.push({
        event: "page_viewed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
    });
});

analytics.subscribe("product_viewed", (event) => {
    window.dataLayer.push({
        event: "product_viewed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        product_id: event.data.productVariant.product.id,
        product_title: event.data.productVariant.title,
        product_sku: event.data.productVariant.sku,
        value: event.data.productVariant.price.amount,
        currency: event.data.productVariant.price.currencyCode,
        product_items: [productVariantToGA4Item(event.data.productVariant)],
    });
});

analytics.subscribe("search_submitted", (event) => {
    window.dataLayer.push({
        event: "search_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        search_query: event.data.searchResult.query,
    });
});

analytics.subscribe("collection_viewed", (event) => {
    window.dataLayer.push({
        event: "collection_viewed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        collection_id: event.data.collection.id,
        collection_title: event.data.collection.title,
        collection_items: shopifyCollectionToGA4Items(event.data.collection),
    });
});

