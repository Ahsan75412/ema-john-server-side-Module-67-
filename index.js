const express =  require('express');
const cors = require('cors');
const port = process.env.PORT || 5000 ; 
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion , ObjectId  } = require('mongodb');



// use middleware for cors origin
app.use(cors());
app.use(express.json());


//connect to mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nhzku.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const productCollection = client.db('emaJohn').collection('product');
        
// get product from mongoDB
        app.get('/product', async(req , res) =>{
            console.log('query',req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = productCollection.find(query);

            let products;
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray();

            }
            else{
                 products = await cursor.toArray();

            }
           
            res.send(products);
        });

        app.get('/productCount',async(req,res)=>{ 
            const count = await productCollection.estimatedDocumentCount();
            // res.json(count);
            res.send({count});
        });


        //use post to get products by id's
        app.post('/productByKeys', async(req, res) =>{
             const keys = req.body;
             const ids = keys.map(id => ObjectId(id));
             const query = {_id: {$in: ids}};
             const cursor = productCollection.find(query);
             const products = await cursor.toArray();
             console.log(keys);
             res.send(products);
        });


    }


    finally{

    }

}
run().catch(console.dir);


//root API
app.get('/',(req,res)=>{
    res.send('John is running and waiting for ema');
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})


