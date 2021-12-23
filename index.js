const express = require('express')
const app = express()
const port = 8000
var returnData = [];

app.get('/', (req, response) => {
  var fs = require('fs'),
    path = require('path'),    
    filePath = path.join(__dirname, 'clicks.json');

fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        console.log('received data: ' + data);
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(data);

        var unique = getUniqueData(JSON.parse(data));

        var updatedData = RemoveIpsMoreThan10Times(JSON.parse(data), unique);
        returnData =[];
        timeIntervals(updatedData);
        console.log('resultset', returnData);
        fs.writeFileSync('result­set.json', JSON.stringify(returnData, null, 2), 'utf8');
        response.end();
    } else {
        console.log(err);
    }
});
})

function getUniqueData(clicks) {
  var lookup = {};
  var result = [];

  for (var item, i = 0; (item = clicks[i++]); ) {
    var ip = item.ip;

    if (!(ip in lookup)) {
      lookup[ip] = 1;
      result.push(ip);
    }
  }
  return result;
}

function RemoveIpsMoreThan10Times(data, unique) {
    unique.forEach(ip => {
        let countOfIp = GetNoOfAppearanceOfEachIp(data, ip);
        if(countOfIp > 10) {
            data = data.filter(e => e.ip != ip);
        }
    });
return data;
}

function GetNoOfAppearanceOfEachIp(data, ip) {
  var count = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].ip == ip) {
      count++;
    }
  }
  return count;
}

function timeIntervals(data) {
  var startPeriodTime = new Date(2020, 2, 11);
  var endPeriodTime = new Date(2020, 2, 11);
  let i = 0;
  while (i < 24) {
    let dataInOneHour = data.filter(
      (d) =>
        new Date(d.timestamp) >= startPeriodTime.setHours(i, 0, 0) &&
        new Date(d.timestamp) <= endPeriodTime.setHours(i, 59, 59)
    );
    if (dataInOneHour.length > 0) {
      GetResultDataOfOneHour(dataInOneHour);
    }
    i++;
  }
}

function GetResultDataOfOneHour(oneHourData) {
  var ipsInOneHour = getUniqueData(oneHourData);
  ipsInOneHour.forEach((ip) => {
    var dataForIp = oneHourData.filter((d) => d.ip == ip);
    dataForIp
      .sort(function (a, b) {
        return parseFloat(a.amount) - parseFloat(b.amount);
      })
      .reverse();

    var filtered = dataForIp.filter((a) => a.amount == dataForIp[0].amount);
    if (filtered.length > 1) {
      filtered
        .sort(function (a, b) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        })
        .reverse();
      returnData.push(filtered[0]);
    } else {
      returnData.push(dataForIp[0]);
    }
  });
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


