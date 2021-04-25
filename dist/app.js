"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
// import routes
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const category_master_routes_1 = __importDefault(require("./routes/category_master.routes"));
const trade_status_master_routes_1 = __importDefault(require("./routes/trade_status_master.routes"));
const garden_routes_1 = __importDefault(require("./routes/garden.routes"));
const listing_routes_1 = __importDefault(require("./routes/listing.routes"));
const trade_offer_routes_1 = __importDefault(require("./routes/trade_offer.routes"));
const app = express_1.default();
app.use(express_1.default.json({
    limit: '50mb'
}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Origin, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    next();
});
// routes
app.use('/api', user_routes_1.default);
app.use('/api/trade', trade_status_master_routes_1.default);
app.use('/api/category', category_master_routes_1.default);
app.use('/api/garden', garden_routes_1.default);
app.use('/api/listing', listing_routes_1.default);
app.use('/api/offer', trade_offer_routes_1.default);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
