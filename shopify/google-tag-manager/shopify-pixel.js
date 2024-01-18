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
var productVariantToGA4Item = function (variant) {
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
var shopifyCartLineToGA4Item = function (cartLine) {
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
// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed
analytics.subscribe("checkout_completed", (event) => {
    var checkout = event.data.checkout || {};
    var shippingAddress = checkout.shippingAddress || {};

    window.dataLayer.push({
        event: "checkout_completed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: checkout.token || "",
        client_id: event.clientId,
        email: checkout.email || "",
        phone: checkout.phone || "",
        first_name: shippingAddress.firstName || "",
        last_name: shippingAddress.lastName || "",
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        country: shippingAddress.country || "",
        countryCode: shippingAddress.countryCode || "",
        province: shippingAddress.province || "",
        provinceCode: shippingAddress.provinceCode || "",
        zip: shippingAddress.zip || "",
        orderId: checkout.order.id,
        checkout_item_skus: (checkout.lineItems || [])
            .map(function (item) {
                return item.variant.sku;
            })
            .join(","),
        checkout_items: (checkout.lineItems || []).map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            checkout.discountApplications || []
        ),
        currency: checkout.currencyCode,
        subtotal: checkout.subtotalPrice.amount,
        shipping: checkout.shippingLine.price.amount,
        value: checkout.totalPrice.amount,
        tax: checkout.totalTax.amount,
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/payment_info_submitted
analytics.subscribe("payment_info_submitted", (event) => {
    var checkout = event.data.checkout || {};
    var shippingAddress = checkout.shippingAddress || {};

    window.dataLayer.push({
        event: "payment_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: checkout.token || "",
        client_id: event.clientId,
        email: checkout.email || "",
        phone: checkout.phone || "",
        first_name: shippingAddress.firstName || "",
        last_name: shippingAddress.lastName || "",
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        country: shippingAddress.country || "",
        countryCode: shippingAddress.countryCode || "",
        province: shippingAddress.province || "",
        provinceCode: shippingAddress.provinceCode || "",
        zip: shippingAddress.zip || "",
        orderId: checkout.order.id || "",
        coupons: commaSeparatedDiscountTitles(
            checkout.discountApplications || []
        ),
        checkout_items: (checkout.lineItems || []).map(
            shopifyCheckoutLineItemToGA4Item
        ),
        currency: checkout.currencyCode || "",
        subtotal: checkout.subtotalPrice.amount,
        shipping: checkout.shippingLine.price.amount,
        value: checkout.totalPrice.amount,
        tax: checkout.totalTax.amount,
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_shipping_info_submitted
analytics.subscribe("checkout_shipping_info_submitted", (event) => {
    var checkout = event.data.checkout || {};
    var shippingAddress = checkout.shippingAddress || {};

    window.dataLayer.push({
        event: "checkout_shipping_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: checkout.token,
        client_id: event.clientId,
        email: checkout.email || "",
        phone: checkout.phone || "",
        first_name: shippingAddress.firstName || "",
        last_name: shippingAddress.lastName || "",
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        country: shippingAddress.country || "",
        countryCode: shippingAddress.countryCode || "",
        province: shippingAddress.province || "",
        provinceCode: shippingAddress.provinceCode || "",
        zip: shippingAddress.zip || "",
        orderId: checkout.order.id,
        checkout_items: (checkout.lineItems || []).map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            checkout.discountApplications || []
        ),
        currency: checkout.currencyCode || "",
        subtotal: checkout.subtotalPrice.amount,
        shipping: checkout.shippingLine.price.amount,
        value: checkout.totalPrice.amount,
        tax: checkout.totalTax.amount,
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_address_info_submitted
analytics.subscribe("checkout_address_info_submitted", (event) => {
    var checkout = event.data.checkout || {};
    var shippingAddress = checkout.shippingAddress || {};

    window.dataLayer.push({
        event: "checkout_address_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: checkout.token || "",
        client_id: event.clientId,
        email: checkout.email || "",
        phone: checkout.phone || "",
        first_name: shippingAddress.firstName || "",
        last_name: shippingAddress.lastName || "",
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        country: shippingAddress.country || "",
        countryCode: shippingAddress.countryCode || "",
        province: shippingAddress.province || "",
        provinceCode: shippingAddress.provinceCode || "",
        zip: shippingAddress.zip || "",
        orderId: checkout.order.id,
        checkout_items: (checkout.lineItems || []).map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            checkout.discountApplications || []
        ),
        currency: checkout.currencyCode || "",
        subtotal: checkout.subtotalPrice.amount,
        shipping: checkout.shippingLine.price.amount,
        value: checkout.totalPrice.amount,
        tax: checkout.totalTax.amount,
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_contact_info_submitted
analytics.subscribe("checkout_contact_info_submitted", (event) => {
    var checkout = event.data.checkout || {};
    var shippingAddress = checkout.shippingAddress || {};

    window.dataLayer.push({
        event: "checkout_contact_info_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: checkout.token || "",
        client_id: event.clientId,
        email: checkout.email || "",
        phone: checkout.phone || "",
        first_name: shippingAddress.firstName || "",
        last_name: shippingAddress.lastName || "",
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        country: shippingAddress.country || "",
        countryCode: shippingAddress.countryCode || "",
        province: shippingAddress.province || "",
        provinceCode: shippingAddress.provinceCode || "",
        zip: shippingAddress.zip || "",
        orderId: checkout.order.id,
        checkout_items: (checkout.lineItems || []).map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            checkout.discountApplications || []
        ),
        currency: checkout.currencyCode || "",
        subtotal: checkout.subtotalPrice.amount,
        shipping: checkout.shippingLine.price.amount,
        value: checkout.totalPrice.amount,
        tax: checkout.totalTax.amount,
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
analytics.subscribe("checkout_started", (event) => {
    var checkout = event.data.checkout || {};
    var shippingAddress = checkout.shippingAddress || {};

    window.dataLayer.push({
        event: "checkout_started",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        token: checkout.token || "",
        client_id: event.clientId,
        email: checkout.email || "",
        phone: checkout.phone || "",
        first_name: shippingAddress.firstName || "",
        last_name: shippingAddress.lastName || "",
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        country: shippingAddress.country || "",
        countryCode: shippingAddress.countryCode || "",
        province: shippingAddress.province || "",
        provinceCode: shippingAddress.provinceCode || "",
        zip: shippingAddress.zip || "",
        orderId: checkout.order.id,
        checkout_items: (checkout.lineItems || []).map(
            shopifyCheckoutLineItemToGA4Item
        ),
        coupons: commaSeparatedDiscountTitles(
            checkout.discountApplications || []
        ),
        currency: checkout.currencyCode || "",
        subtotal: checkout.subtotalPrice.amount,
        shipping: checkout.shippingLine.price.amount,
        value: checkout.totalPrice.amount,
        tax: checkout.totalTax.amount,
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/product_added_to_cart
analytics.subscribe("product_added_to_cart", (event) => {
    var cartLine = event.data.cartLine || {};

    window.dataLayer.push({
        event: "product_added_to_cart",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        price: cartLine.merchandise.price.amount,
        currency: cartLine.cost.totalAmount.currencyCode,
        total_cost: cartLine.cost.totalAmount.amount,
        product_title: cartLine.merchandise.product.title,
        quantity: cartLine.quantity,
        cart_items: [shopifyCartLineToGA4Item(cartLine)],
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/cart_viewed
analytics.subscribe("cart_viewed", (event) => {
    var cart = event.data.cart || {};

    window.dataLayer.push({
        event: "cart_viewed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        currency: cart.cost.totalAmount.currencyCode,
        total_cost: cart.cost.totalAmount.amount,
        quantity: cart.totalQuantity,
        cart_id: cart.id,
        cart_items: cart.lines.map(shopifyCartLineToGA4Item),
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/page_viewed
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

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/product_viewed
analytics.subscribe("product_viewed", (event) => {
    var productVariant = event.data.productVariant || {};

    window.dataLayer.push({
        event: "product_viewed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        product_id: productVariant.product.id,
        product_title: productVariant.title,
        product_sku: productVariant.sku,
        value: productVariant.price.amount,
        currency: productVariant.price.currencyCode,
        product_items: [productVariantToGA4Item(productVariant)],
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/search_submitted
analytics.subscribe("search_submitted", (event) => {
    var searchResult = event.data.searchResult || {};

    window.dataLayer.push({
        event: "search_submitted",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        search_query: searchResult.query,
    });
});

// @see https://shopify.dev/docs/api/web-pixels-api/standard-events/collection_viewed
analytics.subscribe("collection_viewed", (event) => {
    var collection = event.data.collection || {};

    window.dataLayer.push({
        event: "collection_viewed",
        timestamp: event.timestamp,
        event_id: event.id,
        page_location: event.context.window.location.href,
        page_title: event.context.document.title,
        client_id: event.clientId,
        collection_id: collection.id,
        collection_title: collection.title,
        collection_items: shopifyCollectionToGA4Items(collection),
    });
});
