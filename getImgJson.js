const AWS = require('aws-sdk');

let s3 = new AWS.S3();

exports.handler = async (event) => {
    
    //target info on image
    const bucketName = event.Records[0].s3.bucket.name;
    const fileName = event.Records[0].s3.object.key;
    const fileSize = event.Records[0].s3.object.size;
    
    //what is our current images.json in our bucket?
    const params = {
        Bucket: bucketName,
        Key: "images.json"
    };
    
    try{
        //find json file in bucket
        const manifest = await s3.getObject(params).promise();
        
        //read what is in the images.json file
        let manifestData = JSON.parse(manifest.Body.toString());
        
        // add name/size.type to json
        manifestData.push({
            name: fileName,
            size: fileSize,
            type: "image",
            
        });
        
        let manifestBody = JSON.stringify(manifestData);
        
        //write back to the bucket
        await s3.putObject({... params, Body: manifestBody, ContentType: "application/json"}).promise();
        
        console.log("current manifest", manifestData);
        
    }catch(e){
        
        console.log(e);
        
        const newManifest = {
            Bucket: bucketName,
            Key: "images.json",
            Body: JSON.stringify([{name: fileName, size: fileSize, type: "image"}]),
            ContentType: "application/json",
        };
        
        await s3.putObject(newManifest).promise();
    }
    
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
