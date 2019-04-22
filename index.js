﻿/*
 * This file is part of quickbooks-js
 * https://github.com/RappidDevelopment/quickbooks-js
 *
 * Based on qbws: https://github.com/johnballantyne/qbws
 *
 * (c) 2015 johnballantyne
 * (c) 2016 Rappid Development LLC
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var QuickbooksServer = require("./lib/server");
var quickbooksServer = new QuickbooksServer();
var qbXMLHandler = require("./qbXMLHandler.js");
quickbooksServer.setQBXMLHandler(qbXMLHandler);
quickbooksServer.run();
