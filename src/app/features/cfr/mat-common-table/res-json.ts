export const responseJson = {
  "columns": [
    {
      "label": "S.No",
      "key": "sNo",
      "sortable": false,
      "class": "th-common-cls",
      "width": "3",
      "sort": 0
    },
    {
      "label": "State Name",
      "key": "name",
      "sort": 1,
      link: 'nameLink',
      "sortable": true,
      "class": "th-common-cls",
      "width": "8"
    },
    {
      "label": "State Type",
      "key": "stateType",
      "sortable": false,
      "class": "th-common-cls",
      "width": "6",
      "sort": 0
    },
    {
      "label": "Total ULBs",
      "key": "totalULBs",
      "sortable": false,
      "class": "th-common-cls",
      "width": "6",
      "sort": 0
    },
    {
      "label": "Participated ULBs",
      "key": "participatedUlbs",
      "sortable": true,
      "class": "th-common-cls",
      "width": "7",
      "sort": 0
    },
    {
      "label": "Ranked ULBs",
      "key": "rankedUlbs",
      "sortable": true,
      "class": "th-common-cls",
      "width": "6",
      "sort": 0
    },
    {
      "label": "Non Ranked ULBs",
      "key": "nonRankedUlbs",
      "sortable": true,
      "class": "th-common-cls",
      "width": "7",
      "sort": 0
    },
    {
      "label": "Ranked to Total(%)",
      "key": "rankedtoTotal",
      "sortable": true,
      "class": "th-color-cls",
      "width": "7",
      "sort": 0
    }
  ],
  "subHeaders": ["", "", "", "A", "B", "C", "D", "E = C/ A * 100"],
  "name": "",
  "data": [
    {
      "_id": "5dcf9d7216a06aed41c748dd",
      "sNo": 1,
      "name": "Andhra Pradesh",
      "totalULBs": 123,
      "participatedUlbs": 123,
      "rankedUlbs": 88,
      "nonRankedUlbs": 35,
      "rankedtoTotal": 71.54,
      "nameLink": "/cfr/participated-ulbs/5dcf9d7216a06aed41c748dd"
    },
    {
      "_id": "5dcf9d7216a06aed41c748e2",
      "sNo": 2,
      "name": "Chhattisgarh",
      "totalULBs": 169,
      "participatedUlbs": 169,
      "rankedUlbs": 118,
      "nonRankedUlbs": 51,
      "rankedtoTotal": 69.82,
      "nameLink": "/cfr/participated-ulbs/5dcf9d7216a06aed41c748e2"
    },
    {
      "_id": "5dcf9d7516a06aed41c748fa",
      "sNo": 3,
      "name": "Tamil Nadu",
      "totalULBs": 651,
      "participatedUlbs": 651,
      "rankedUlbs": 424,
      "nonRankedUlbs": 227,
      "rankedtoTotal": 65.13,
      "nameLink": "/cfr/participated-ulbs/5dcf9d7516a06aed41c748fa"
    },
    {
      "_id": "5fa25a6e0fb1d349c0fdfbc7",
      "sNo": 4,
      "name": "Chandigarh",
      "totalULBs": 1,
      "participatedUlbs": 1,
      "rankedUlbs": 0,
      "nonRankedUlbs": 1,
      "rankedtoTotal": 0,
      "nameLink": "/cfr/participated-ulbs/5fa25a6e0fb1d349c0fdfbc7"
    },
    {
      "_id": "5dcf9d7516a06aed41c748fb",
      "sNo": 5,
      "name": "Telangana",
      "totalULBs": 143,
      "participatedUlbs": 141,
      "rankedUlbs": 67,
      "nonRankedUlbs": 74,
      "rankedtoTotal": 46.85,
      "nameLink": "/cfr/participated-ulbs/5dcf9d7516a06aed41c748fb"
    },
    {
      "_id": "5dcf9d7316a06aed41c748e7",
      "sNo": 6,
      "name": "Gujarat",
      "totalULBs": 166,
      "participatedUlbs": 161,
      "rankedUlbs": 108,
      "nonRankedUlbs": 53,
      "rankedtoTotal": 65.06,
      "nameLink": "/cfr/participated-ulbs/5dcf9d7316a06aed41c748e7"
    },
    {
      "_id": "5dcf9d7416a06aed41c748f0",
      "sNo": 7,
      "name": "Maharashtra",
      "totalULBs": 417,
      "participatedUlbs": 400,
      "rankedUlbs": 276,
      "nonRankedUlbs": 124,
      "rankedtoTotal": 66.19,
      "nameLink": "/cfr/participated-ulbs/5dcf9d7416a06aed41c748f0"
    },

    {
      "_id": "5efd6a2fb5cd039b5c0cfed2",
      "sNo": 36,
      "name": "Ladakh",
      "totalULBs": 2,
      "participatedUlbs": 0,
      "rankedUlbs": 0,
      "nonRankedUlbs": 0,
      "rankedtoTotal": 0,
      "nameLink": "/cfr/participated-ulbs/5efd6a2fb5cd039b5c0cfed2"
    }
  ],
  "lastRow": ["", "", "Total", "$sum", "$sum", "$sum", "$sum", "$sum"],
  "total": 36
};
