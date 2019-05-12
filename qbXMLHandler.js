var data2xml = require("data2xml");
var convert = data2xml({
  xmlHeader:
    '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n'
});
const fs = require("fs");
let dumpFile = (name, data) => {
  fs.writeFile(name, data, () => console.log("dumped"));
};
// Public
module.exports = {
  /**
   * Builds an array of qbXML commands
   * to be run by QBWC.
   *
   * @param callback(err, requestArray)
   */
  fetchRequests: function(username, callback) {
    buildRequests(username, callback);
  },

  /**
   * Called when a qbXML response
   * is returned from QBWC.
   *
   * @param response - qbXML response
   */
  handleResponse: function(response) {
    // console.log(response);
    dumpFile("response.xml", response);
  },

  /**
   * Called when there is an error
   * returned processing qbXML from QBWC.
   *
   * @param error - qbXML error response
   */
  didReceiveError: function(error) {
    console.log(error);
  }
};
const faker = require("faker");
const moment = require("moment");
const userMap = require("./lib/userMap");

const getAddress = () => {
  if (Math.random() >= 0.5) {
    return null;
  }
  return {
    Addr1: faker.address.streetAddress(),
    City: faker.address.city(),
    State: faker.address.state(),
    PostalCode: faker.address.zipCode(),
    Country: faker.address.country()
  };
};

const CUSTOMER_LENGTH = 10;
const LINE_ITEMS = [
  "General",
  "Item2",
  "Item3",
  "Item4",
  "Item5",
  "Item6",
  "Item7"
];

let customerNames = [];
let getRandomName = count => {
  customerNames = [];
  for (let i = 0; i < count; i++) {
    customerNames.push(faker.name.firstName() + " " + faker.name.lastName());
  }
  console.log("generated customer", count, customerNames.length);
};

let generateCustomers = function(count) {
  let customers = { CustomerAddRq: [] };
  for (let i = 0; i < count; i++) {
    let customerName = customerNames[i];
    let splitName = customerName.split(" ");
    let firstName = splitName[0];
    let lastName = splitName[1];
    customers.CustomerAddRq.push({
      CustomerAdd: {
        Name: customerName,
        CompanyName: faker.company.companyName(),
        FirstName: firstName,
        LastName: lastName,
        Phone: faker.phone.phoneNumber("###-###-####"),
        Email: faker.internet.userName() + "@getnada.com",
        Contact: customerName
      }
    });
  }
  console.log(`GENERATED ${customers.CustomerAddRq.length} CUSTOMERS`);
  return customers;
};

let getRandomInt = max => {
  let min = 1;
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

let generateInvoices = function(count) {
  let invoices = {
    InvoiceAddRq: []
  };
  console.log("GENERATING INVOICE");
  for (let i = 0; i < count; i++) {
    let FullName = customerNames[i];
    let invoicesPerCustomer = getRandomInt(10);

    for (let j = 0; j < invoicesPerCustomer; j++) {
      let invoice = {
        CustomerRef: {
          FullName
        },
        TxnDate: moment(faker.date.between("2018-01-01", "2018-06-05")).format(
          "YYYY-MM-DD"
        ),
        RefNumber: faker.random.number(),
        BillAddress: getAddress(),
        ShipAddress: getAddress(),
        InvoiceLineAdd: []
      };

      let lineItems = faker.helpers.shuffle(["General", "Item2", "Item3"]);

      let lineItemCount = getRandomInt(3);
      for (let i = 0; i < lineItemCount; i++) {
        invoice.InvoiceLineAdd.push({
          ItemRef: {
            FullName: lineItems.pop()
          },
          Desc: "General Invoice Item",
          Quantity: getRandomInt(5),
          Rate: getRandomInt(1000)
        });
      }

      invoices.InvoiceAddRq.push({ InvoiceAdd: invoice });
    }
  }

  console.log(`GENERATED ${invoices.InvoiceAddRq.length} INVOICES`);

  return invoices;
};

let generateEstimates = function(count) {
  let estimates = {
    EstimateAddRq: []
  };
  console.log("GENERATING ESTIMATES");
  for (let i = 0; i < count; i++) {
    let FullName = customerNames[i];
    let estimatesPerCustomer = getRandomInt(2);
    for (let j = 0; j < estimatesPerCustomer; j++) {
      let estimate = {
        CustomerRef: {
          FullName
        },
        TxnDate: moment(faker.date.between("2018-01-01", "2018-06-05")).format(
          "YYYY-MM-DD"
        ),
        RefNumber: faker.random.number(),
        BillAddress: getAddress(),
        ShipAddress: getAddress(),
        EstimateLineAdd: []
      };

      let lineItems = faker.helpers.shuffle(LINE_ITEMS);

      let lineItemCount = getRandomInt(3);
      for (let i = 0; i < lineItemCount; i++) {
        let lineItemName = lineItems.pop();
        estimate.EstimateLineAdd.push({
          ItemRef: {
            FullName: lineItemName
          },
          Desc: "General Invoice Item" + lineItemName,
          Quantity: getRandomInt(5),
          Rate: getRandomInt(1000)
        });
      }

      estimates.EstimateAddRq.push({ EstimateAdd: estimate });
    }
  }
  console.log(`GENERATED ${estimates.EstimateAddRq.length} ESTIMATES`);
  return estimates;
};

let generateServiceItems = () => {
  let query = [];
  for (let item of LINE_ITEMS) {
    query.push({
      ItemServiceAdd: {
        Name: item,
        SalesOrPurchase: {
          Desc: "Description of line item " + item,
          Price: 100.0,
          AccountRef: {
            FullName: "Faker"
          }
        }
      }
    });
  }

  return query;
};

function buildRequests(username, callback) {
  try {
    console.log(userMap, username);
    var count = userMap[username] || CUSTOMER_LENGTH;
    getRandomName(count);
    var requests = new Array();
    var xml = convert("QBXML", {
      QBXMLMsgsRq: {
        _attr: { onError: "continueOnError" },
        ItemServiceAddRq: generateServiceItems(count),
        CustomerAddRq: generateCustomers(count).CustomerAddRq,
        InvoiceAddRq: generateInvoices(count).InvoiceAddRq,
        EstimateAddRq: generateEstimates(count).EstimateAddRq
      }
    });
    requests.push(xml);
    console.log("REQUEST QUEUE READY");
    return callback(null, requests);
  } catch (err) {
    return callback(err, null);
  }
}
