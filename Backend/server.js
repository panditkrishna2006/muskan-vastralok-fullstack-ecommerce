const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");


/* =========================================================
   LOAD ENVIRONMENT VARIABLES
========================================================= */

dotenv.config({
    path: path.join(__dirname, ".env")
});


/* =========================================================
   APP
========================================================= */

const app = express();

const PORT =
    process.env.PORT || 5000;


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SECRET_KEY =
    process.env.SUPABASE_SECRET_KEY;


/* =========================================================
   ADMIN CONFIG
========================================================= */

const ADMIN_EMAIL =
    process.env.ADMIN_EMAIL;

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;

const ADMIN_SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET;


/* =========================================================
   CHECK ENVIRONMENT VARIABLES
========================================================= */

if (
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
) {

    console.error(
        "❌ Supabase environment variables are missing."
    );

    process.exit(1);

}


if (
    !ADMIN_EMAIL ||
    !ADMIN_PASSWORD ||
    !ADMIN_SESSION_SECRET
) {

    console.error(
        "❌ Admin environment variables are missing."
    );

    console.error(
        "Make sure ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET exist in Backend/.env"
    );

    process.exit(1);

}


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY
    );


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors({

        origin: true,

        credentials: true

    })
);


app.use(
    express.json()
);


/* =========================================================
   ADMIN COOKIE
========================================================= */

const ADMIN_COOKIE_NAME =
    "muskan_admin_token";


/* =========================================================
   BASE64 URL ENCODE
========================================================= */

function base64UrlEncode(
    value
) {

    return Buffer
        .from(value)
        .toString("base64")
        .replace(
            /\+/g,
            "-"
        )
        .replace(
            /\//g,
            "_"
        )
        .replace(
            /=/g,
            ""
        );

}


/* =========================================================
   BASE64 URL DECODE
========================================================= */

function base64UrlDecode(
    value
) {

    value =
        value
            .replace(
                /-/g,
                "+"
            )
            .replace(
                /_/g,
                "/"
            );


    while (
        value.length % 4 !== 0
    ) {

        value += "=";

    }


    return Buffer
        .from(
            value,
            "base64"
        )
        .toString("utf8");

}


/* =========================================================
   CREATE ADMIN TOKEN
========================================================= */

function signAdminToken(
    payload
) {

    const encodedPayload =
        base64UrlEncode(
            JSON.stringify(
                payload
            )
        );


    const signature =
        crypto
            .createHmac(
                "sha256",
                ADMIN_SESSION_SECRET
            )
            .update(
                encodedPayload
            )
            .digest("base64")
            .replace(
                /\+/g,
                "-"
            )
            .replace(
                /\//g,
                "_"
            )
            .replace(
                /=/g,
                ""
            );


    return (
        encodedPayload +
        "." +
        signature
    );

}


/* =========================================================
   VERIFY ADMIN TOKEN
========================================================= */

function verifyAdminToken(
    token
) {

    try {

        if (!token) {

            return null;

        }


        const parts =
            token.split(".");


        if (
            parts.length !== 2
        ) {

            return null;

        }


        const encodedPayload =
            parts[0];

        const receivedSignature =
            parts[1];


        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    ADMIN_SESSION_SECRET
                )
                .update(
                    encodedPayload
                )
                .digest("base64")
                .replace(
                    /\+/g,
                    "-"
                )
                .replace(
                    /\//g,
                    "_"
                )
                .replace(
                    /=/g,
                    ""
                );


        const receivedBuffer =
            Buffer.from(
                receivedSignature
            );


        const expectedBuffer =
            Buffer.from(
                expectedSignature
            );


        if (
            receivedBuffer.length !==
            expectedBuffer.length
        ) {

            return null;

        }


        if (
            !crypto.timingSafeEqual(
                receivedBuffer,
                expectedBuffer
            )
        ) {

            return null;

        }


        const payload =
            JSON.parse(
                base64UrlDecode(
                    encodedPayload
                )
            );


        if (
            !payload.exp ||
            Date.now() > payload.exp
        ) {

            return null;

        }


        return payload;

    }

    catch (error) {

        console.error(
            "❌ Token verification error:",
            error.message
        );

        return null;

    }

}


/* =========================================================
   GET COOKIE
========================================================= */

function getCookie(
    req,
    name
) {

    const cookieHeader =
        req.headers.cookie;


    if (!cookieHeader) {

        return null;

    }


    const cookies =
        cookieHeader
            .split(";")
            .map(
                cookie =>
                    cookie.trim()
            );


    for (
        const cookie
        of cookies
    ) {

        const separator =
            cookie.indexOf("=");


        if (
            separator === -1
        ) {

            continue;

        }


        const key =
            cookie.substring(
                0,
                separator
            );


        const value =
            cookie.substring(
                separator + 1
            );


        if (
            key === name
        ) {

            return decodeURIComponent(
                value
            );

        }

    }


    return null;

}


/* =========================================================
   ADMIN AUTH MIDDLEWARE
   HEADER + COOKIE
========================================================= */

function requireAdmin(
    req,
    res,
    next
) {

    let token = null;


    /* =====================================================
       FIRST: AUTHORIZATION HEADER
    ===================================================== */

    const authHeader =
        req.headers.authorization;


    if (
        authHeader &&
        authHeader.startsWith(
            "Bearer "
        )
    ) {

        token =
            authHeader
                .substring(7)
                .trim();

    }


    /* =====================================================
       SECOND: COOKIE
    ===================================================== */

    if (!token) {

        token =
            getCookie(
                req,
                ADMIN_COOKIE_NAME
            );

    }


    /* =====================================================
       VERIFY
    ===================================================== */

    const admin =
        verifyAdminToken(
            token
        );


    if (!admin) {

        return res.status(401).json({

            success: false,

            message:
                "Admin authentication required."

        });

    }


    req.admin =
        admin;


    next();

}


/* =========================================================
   HOME
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Muskan Vastralok Backend is running!"

        });

    }
);


/* =========================================================
   GET ALL PRODUCTS
   GET /api/products
========================================================= */

app.get(
    "/api/products",
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase

                .from("products")

                .select("*")

                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


            if (error) {

                console.error(
                    "❌ Supabase Error:",
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch products",

                    error:
                        error.message

                });

            }


            res.json({

                success: true,

                count:
                    data.length,

                products:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Server Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Internal server error"

            });

        }

    }
);


/* =========================================================
   GET SINGLE PRODUCT
   GET /api/products/:id
========================================================= */

app.get(
    "/api/products/:id",
    async (req, res) => {

        try {

            const productId =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID."

                });

            }


            const {
                data,
                error
            } = await supabase

                .from("products")

                .select("*")

                .eq(
                    "id",
                    productId
                )

                .single();


            if (error) {

                console.error(
                    "❌ Supabase Error:",
                    error
                );


                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found.",

                    error:
                        error.message

                });

            }


            res.json({

                success: true,

                product:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Server Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Internal server error."

            });

        }

    }
);


/* =========================================================
   SHIPPING / PINCODE
========================================================= */

const SHIPPING_CHARGE =
    79;


const pincodeCache =
    new Map();


const PINCODE_CACHE_TTL =
    10 * 60 * 1000;


/* =========================================================
   PINCODE DETAILS
========================================================= */

async function getPincodeDetails(
    pincode
) {

    const normalizedPincode =
        String(
            pincode || ""
        ).trim();


    if (
        !/^[1-9][0-9]{5}$/.test(
            normalizedPincode
        )
    ) {

        throw new Error(
            "Please enter a valid 6-digit PIN code."
        );

    }


    /* =====================================================
       CACHE
    ===================================================== */

    const cached =
        pincodeCache.get(
            normalizedPincode
        );


    if (
        cached &&
        Date.now() -
            cached.time <
            PINCODE_CACHE_TTL
    ) {

        return cached.data;

    }


    /* =====================================================
       CONTROLLER
    ===================================================== */

    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {

                controller.abort();

            },
            8000
        );


    try {

        const response =
            await fetch(

                `https://api.postalpincode.in/pincode/${normalizedPincode}`,

                {

                    method:
                        "GET",

                    headers: {

                        Accept:
                            "application/json"

                    },

                    signal:
                        controller.signal

                }

            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Pincode service is temporarily unavailable."
            );

        }


        const data =
            await response.json();


        const result =
            Array.isArray(data)
                ? data[0]
                : null;


        const postOffices =
            Array.isArray(
                result?.PostOffice
            )
                ? result.PostOffice
                : [];


        const deliveryOffices =
            postOffices.filter(
                office =>
                    String(
                        office.DeliveryStatus ||
                        ""
                    ).toLowerCase() ===
                    "delivery"
            );


        /* =================================================
           NOT SERVICEABLE
        ================================================= */

        if (

            String(
                result?.Status ||
                ""
            ).toLowerCase() !==
                "success"

            ||

            deliveryOffices.length === 0

        ) {

            const unavailableData = {

                serviceable:
                    false,

                pincode:
                    normalizedPincode,

                shippingCharge:
                    0,

                city:
                    "",

                state:
                    "",

                postOffice:
                    "",

                message:
                    "Delivery is not available for this PIN code."

            };


            pincodeCache.set(

                normalizedPincode,

                {

                    time:
                        Date.now(),

                    data:
                        unavailableData

                }

            );


            return unavailableData;

        }


        /* =================================================
           SERVICEABLE
        ================================================= */

        const office =
            deliveryOffices[0];


        const serviceableData = {

            serviceable:
                true,

            pincode:
                normalizedPincode,

            shippingCharge:
                SHIPPING_CHARGE,

            city:
                office.District ||
                "",

            state:
                office.State ||
                "",

            postOffice:
                office.Name ||
                "",

            message:
                `Delivery available to ${
                    office.District ||
                    "your area"
                }.`

        };


        pincodeCache.set(

            normalizedPincode,

            {

                time:
                    Date.now(),

                data:
                    serviceableData

            }

        );


        return serviceableData;

    }

    catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "Pincode service timed out. Please try again."
            );

        }


        throw error;

    }

    finally {

        clearTimeout(
            timeout
        );

    }

}


/* =========================================================
   CHECK SHIPPING
   GET /api/shipping?pincode=202001
========================================================= */

app.get(
    "/api/shipping",
    async (req, res) => {

        try {

            const pincode =
                String(
                    req.query.pincode ||
                    ""
                ).trim();


            if (
                !/^[1-9][0-9]{5}$/.test(
                    pincode
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 6-digit PIN code."

                });

            }


            const shipping =
                await getPincodeDetails(
                    pincode
                );


            res.json({

                success:
                    true,

                serviceable:
                    shipping.serviceable,

                pincode:
                    shipping.pincode,

                shippingCharge:
                    shipping.shippingCharge,

                city:
                    shipping.city,

                state:
                    shipping.state,

                postOffice:
                    shipping.postOffice,

                message:
                    shipping.message

            });

        }

        catch (error) {

            console.error(
                "❌ Shipping API Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to check delivery."

            });

        }

    }
);


/* =========================================================
   CREATE ORDER
   POST /api/orders
========================================================= */

app.post(
    "/api/orders",
    async (req, res) => {

        try {

            const {
                customer,
                address,
                paymentMethod,
                cart
            } = req.body;


            /* =================================================
               VALIDATION
            ================================================= */

            if (

                !customer?.name ||

                !customer?.phone ||

                !address?.addressLine ||

                !address?.city ||

                !address?.state ||

                !address?.pincode ||

                !paymentMethod ||

                !Array.isArray(
                    cart
                ) ||

                cart.length === 0

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Incomplete order details."

                });

            }


            /* =================================================
               PINCODE
            ================================================= */

            const pincode =
                String(
                    address.pincode
                ).trim();


            if (
                !/^[1-9][0-9]{5}$/.test(
                    pincode
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 6-digit PIN code."

                });

            }


            /* =================================================
               DELIVERY CHECK
            ================================================= */

            const shipping =
                await getPincodeDetails(
                    pincode
                );


            if (
                !shipping.serviceable
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        shipping.message ||
                        "Delivery is not available at this PIN code."

                });

            }


            /* =================================================
               ATOMIC DATABASE FUNCTION
            ================================================= */

            const {
                data,
                error
            } = await supabase.rpc(

                "create_order_atomic",

                {

                    p_customer_name:
                        customer.name,

                    p_customer_phone:
                        customer.phone,

                    p_address_line:
                        address.addressLine,

                    p_city:
                        address.city,

                    p_state:
                        address.state,

                    p_pincode:
                        pincode,

                    p_payment_method:
                        paymentMethod,

                    p_items:

                        cart.map(
                            item => ({

                                id:
                                    Number(
                                        item.id
                                    ),

                                quantity:
                                    Number(
                                        item.quantity
                                    )

                            })
                        )

                }

            );


            if (error) {

                console.error(
                    "❌ Order RPC Error:",
                    error
                );


                return res.status(400).json({

                    success: false,

                    message:
                        error.message

                });

            }


            res.status(201).json({

                success:
                    true,

                message:
                    "Order created successfully.",

                order:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Order API Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Internal server error."

            });

        }

    }
);


/* =========================================================
   GET SINGLE ORDER
   GET /api/orders/:id
========================================================= */

app.get(
    "/api/orders/:id",
    async (req, res) => {

        try {

            const orderId =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(
                    orderId
                ) ||
                orderId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid order ID."

                });

            }


            const {
                data,
                error
            } = await supabase

                .from("orders")

                .select(`
                    *,
                    order_items (
                        id,
                        product_id,
                        product_name,
                        price,
                        quantity,
                        created_at
                    )
                `)

                .eq(
                    "id",
                    orderId
                )

                .single();


            if (error) {

                console.error(
                    "❌ Order Fetch Error:",
                    error
                );


                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found.",

                    error:
                        error.message

                });

            }


            res.json({

                success:
                    true,

                order:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Order API Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Internal server error."

            });

        }

    }
);


/* =========================================================
   ADMIN LOGIN
   POST /api/admin/login
========================================================= */

app.post(
    "/api/admin/login",
    (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            /* =================================================
               VALIDATE INPUT
            ================================================= */

            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password are required."

                });

            }


            /* =================================================
               CHECK CREDENTIALS
            ================================================= */

            if (
                email.trim() !==
                    ADMIN_EMAIL.trim() ||

                password !==
                    ADMIN_PASSWORD
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid admin credentials."

                });

            }


            /* =================================================
               CREATE TOKEN
            ================================================= */

            const token =
                signAdminToken({

                    role:
                        "admin",

                    email:
                        ADMIN_EMAIL,

                    exp:
                        Date.now() +
                        (
                            8 *
                            60 *
                            60 *
                            1000
                        )

                });


            /* =================================================
               ALSO SET COOKIE
            ================================================= */

            res.setHeader(

                "Set-Cookie",

                `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=28800`

            );


            /* =================================================
               RETURN TOKEN TO FRONTEND
            ================================================= */

            res.json({

                success:
                    true,

                message:
                    "Admin login successful.",

                token:
                    token

            });

        }

        catch (error) {

            console.error(
                "❌ Admin Login Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to login."

            });

        }

    }
);


/* =========================================================
   ADMIN LOGOUT
========================================================= */

app.post(
    "/api/admin/logout",
    (req, res) => {

        res.setHeader(

            "Set-Cookie",

            `${ADMIN_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`

        );


        res.json({

            success:
                true,

            message:
                "Logged out successfully."

        });

    }
);


/* =========================================================
   ADMIN SESSION
   GET /api/admin/me
========================================================= */

app.get(
    "/api/admin/me",
    requireAdmin,
    (req, res) => {

        res.json({

            success:
                true,

            admin: {

                email:
                    req.admin.email,

                role:
                    req.admin.role

            }

        });

    }
);


/* =========================================================
   ADMIN DASHBOARD STATS
========================================================= */

app.get(
    "/api/admin/stats",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                data: products,
                error: productError
            } = await supabase

                .from("products")

                .select(
                    "id, stock"
                );


            if (productError) {

                throw productError;

            }


            const {
                data: orders,
                error: orderError
            } = await supabase

                .from("orders")

                .select(
                    "id, order_status, total_amount"
                );


            if (orderError) {

                throw orderError;

            }


            const lowStock =
                products.filter(
                    product =>
                        Number(
                            product.stock
                        ) <= 5
                ).length;


            const pendingOrders =
                orders.filter(
                    order =>

                        [
                            "placed",
                            "confirmed",
                            "packed"
                        ].includes(
                            String(
                                order.order_status
                            ).toLowerCase()
                        )

                ).length;


            const revenue =
                orders

                    .filter(
                        order =>
                            String(
                                order.order_status
                            ).toLowerCase()
                            !== "cancelled"
                    )

                    .reduce(
                        (
                            total,
                            order
                        ) =>
                            total +
                            Number(
                                order.total_amount ||
                                0
                            ),
                        0
                    );


            res.json({

                success:
                    true,

                stats: {

                    totalProducts:
                        products.length,

                    totalOrders:
                        orders.length,

                    pendingOrders:
                        pendingOrders,

                    lowStock:
                        lowStock,

                    revenue:
                        revenue

                }

            });

        }

        catch (error) {

            console.error(
                "❌ Admin Stats Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load dashboard."

            });

        }

    }
);


/* =========================================================
   ADMIN ORDERS
========================================================= */

app.get(
    "/api/admin/orders",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase

                .from("orders")

                .select(`
                    *,
                    order_items (
                        id,
                        product_id,
                        product_name,
                        price,
                        quantity
                    )
                `)

                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


            if (error) {

                throw error;

            }


            res.json({

                success:
                    true,

                orders:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Admin Orders Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load orders."

            });

        }

    }
);


/* =========================================================
   ADMIN PRODUCTS
========================================================= */

app.get(
    "/api/admin/products",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                data,
                error
            } = await supabase

                .from("products")

                .select("*")

                .order(
                    "id",
                    {
                        ascending:
                            true
                    }
                );


            if (error) {

                throw error;

            }


            res.json({

                success:
                    true,

                products:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Admin Products Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load products."

            });

        }

    }
);


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

app.patch(
    "/api/admin/orders/:id/status",
    requireAdmin,
    async (req, res) => {

        try {

            const orderId =
                Number(
                    req.params.id
                );


            const {
                status
            } = req.body;


            const allowedStatuses = [

                "placed",

                "confirmed",

                "packed",

                "shipped",

                "out_for_delivery",

                "delivered",

                "cancelled"

            ];


            if (
                !Number.isInteger(
                    orderId
                ) ||
                orderId <= 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid order ID."

                });

            }


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid order status."

                });

            }


            const {
                data,
                error
            } = await supabase

                .from("orders")

                .update({

                    order_status:
                        status

                })

                .eq(
                    "id",
                    orderId
                )

                .select()
                .single();


            if (error) {

                throw error;

            }


            res.json({

                success:
                    true,

                message:
                    "Order status updated.",

                order:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Status Update Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to update order status."

            });

        }

    }
);


/* =========================================================
   UPDATE PRODUCT
========================================================= */

app.patch(
    "/api/admin/products/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const productId =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid product ID."

                });

            }


            const {
                price,
                stock,
                availability,
                cod_enabled
            } = req.body;


            const updates = {};


            /* =================================================
               PRICE
            ================================================= */

            if (
                price !== undefined
            ) {

                const numericPrice =
                    Number(price);


                if (
                    !Number.isFinite(
                        numericPrice
                    ) ||
                    numericPrice < 0
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Invalid price."

                    });

                }


                updates.price =
                    numericPrice;

            }


            /* =================================================
               STOCK
            ================================================= */

            if (
                stock !== undefined
            ) {

                const numericStock =
                    Number(stock);


                if (
                    !Number.isInteger(
                        numericStock
                    ) ||
                    numericStock < 0
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Invalid stock."

                    });

                }


                updates.stock =
                    numericStock;

            }


            /* =================================================
               AVAILABILITY
            ================================================= */

            if (
                availability !== undefined
            ) {

                updates.availability =
                    String(
                        availability
                    );

            }


            /* =================================================
               COD
            ================================================= */

            if (
                cod_enabled !== undefined
            ) {

                updates.cod_enabled =
                    Boolean(
                        cod_enabled
                    );

            }


            if (
                Object.keys(
                    updates
                ).length === 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "No product changes provided."

                });

            }


            const {
                data,
                error
            } = await supabase

                .from("products")

                .update(
                    updates
                )

                .eq(
                    "id",
                    productId
                )

                .select()
                .single();


            if (error) {

                throw error;

            }


            res.json({

                success:
                    true,

                message:
                    "Product updated successfully.",

                product:
                    data

            });

        }

        catch (error) {

            console.error(
                "❌ Product Update Error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to update product."

            });

        }

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `✅ Server running on http://localhost:${PORT}`
        );

    }
);