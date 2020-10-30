var objoracle = require('oracledb');
cns = {
    user: "TEST",
    password: "1234",
    connectString: "(DESCRIPTION =(LOAD_BALANCE = ON)(FAILOVER = ON)(ADDRESS =(PROTOCOL = TCP)(HOST = 172.17.0.2)(PORT = 1521))(ADDRESS = (PROTOCOL = TCP)(HOST = 172.17.0.2)(PORT=1521))(CONNECT_DATA=(SID=ORCL18)(FAILOVER_MODE=(TYPE=SELECT)(METHOD = BASIC))))"
};
function error(err, rs, cn){
    if(err){
        console.log(err.message);
        rs.contentType('applicaction/json').status(500);
        rs.send(err.message);
        if(cn != null) close(cn);
        return -1;
    }else{
        return 0;
    }
}
function open(sql, binds, dml, rs){
    objoracle.getConnection(cns, function(err, cn){
        if(error(err, rs, null) == -1) return;
        cn.execute(sql, binds, {autoCommit: dml}, function(err, result){
            if(error(err, rs, cn) == -1) return;
            rs.contentType('application/json').status(200);
            if(dml)
            rs.send(JSON.stringify(result.rowsAffected));
            else{
                //console.log(result.metaData);
                rs.outFormat = objoracle.OBJECT;
                rs.send(JSON.stringify(result.rows));
            }
            close(cn);
        }
        );
    })
}

function close(cn){
    cn.release(
        function(err){
            if(err){
                console.error(err.message);
            }
        }
    );
}

exports.open = open;
exports.close = close;
