const net = require('net');

const jdb = {
  'imei': [],
  'id': [],
  'inc': 0
}

const server = net.createServer((sock) => {
  console.log('Client Connected: ' + sock.remoteAddress + '\r\n');
  
  sock.sentImeiResponse = false;
  sock.id = jdb.inc;
  
  sock.on('end', (data) => {
    console.log('Socket ended from other end!');
    console.log('End data : ' + data);
  });

  sock.on('close', (err) => {
    console.log('Client Disconnected: ');
  });

  sock.on('data', (data) => {

    const buff = Buffer.from(data);
      if(sock.sentImeiResponse == false) {
        if(data.length == 17 || data.length == 19) {
          if(buff[0] == 0x00 && buff[1] == 0x0F) {
    
            let sliced = buff.slice(2, buff.length);
    
            if(sliced.length == 15) {
              setTimeout(() => {
                sock.write(Buffer.alloc(1, 0x01));
              },2000);
  
              sock.sentImeiResponse = true;
              jdb.imei.push(sliced.toString());
              jdb.id.push(jdb.inc);
            }
          }
          
          if(buff[0] == 0x00 && buff[1] == 0x11) {
    
            let sliced = buff.slice(2, buff.length);
    
            if(sliced.length == 17) {
              setTimeout(() => {
                sock.write(Buffer.alloc(1, 0x00));
              },2000);
  
              sock.sentImeiResponse = true;
              jdb.imei.push(sliced.toString());
              jdb.id.push(jdb.inc);
            }
          }
        } else {
          setTimeout(() => {
            sock.write(Buffer.alloc(1, 0x0000));
          },2000);
          sock.sentImeiResponse = true;
        }
      }

    if(sock.sentImeiResponse == true) {
      console.log('Id: ' + sock.id + ' / ' + jdb.imei[sock.id] + 'user sent: ' + buff.toString());
    }


  });

  jdb.inc++;
  sock.pipe(sock);
});

server.on('error', (err) => {
  throw err;
});

server.listen(7777, '127.0.0.1', () => {
  console.log('Server Started!');
});
