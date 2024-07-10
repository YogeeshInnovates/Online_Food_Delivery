const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const app = express();
const port = 3000;
const path=require('path');
const bodyParser = require('body-parser');


const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const ejs = require('ejs');

// Parse JSON bodies
app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'onlinefood', // Replace with your database name
});


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// const nodemailer = require('nodemailer');


app.set('views', path.join(__dirname, 'public','views'));
app.use(express.static('public'));
// Set EJS as the view engine
app.set('view engine', 'ejs');

const { v4: uuidv4 } = require('uuid');

function generateUserId() {
    return uuidv4();
}


  











app.get('/', async (req, res) => {

  
  
    const userData = req.cookies.userId;
    let userId;

    if (userData) {
        userId = JSON.parse(userData).userId;
    } else {
        userId = false;
    }

    console.log("userId:", userId);

    // Proceed with rendering the actual content page once userId is determined
    if (userId) {
        res.render('loading');
    } else {
        console.log("Creating userId now");
        userId = generateUserId(); // Assuming you have a function to generate userId
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Expires after 1 year
        res.cookie('userId', JSON.stringify({ userId }), { expires: expirationDate });
        res.render('loading');
    }
});

app.get('/goto_home', (req, res) => {
    // Render the home2 view
    res.render('home');
});



app.get('/home2',(req,res)=>{  

    const userData=req.cookies.userData ?JSON.parse(req.cookies.userData):null;
    const username=userData ? userData.name : null
    const phone=userData? userData.phone:null;

    // Render he template
    if(username&& phone){
        issignup=1;
   
    }else{
          // redirect to login
          issignup=false;
    }

    if(issignup)
    {
    
      res.render('home2', { isLoggedIn:issignup });
    }
    else{
      res.render('home2', { isLoggedIn:false });
    }



});

app.get('/SignUp',(req,res)=>{
      const userSignupconsirm=req.cookies.usersignId?JSON.parse(req.cookies.usersignId):null;
    const issignup=userSignupconsirm ?userSignupconsirm.userId : null
    // const userData = req.cookies.usersignId;
    // let issignup = false;
console.log(issignup);
  if(issignup)
  {
  
    res.render('login');
  }
  else{
    res.render('SignUp');
  }
    
  
 });

app.get('/profileinfo',(req,res)=>{
    const userData = req.cookies.userId;
    let userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }

    const userSignupconsirm=req.cookies.usersignId?JSON.parse(req.cookies.usersignId):null;
    const signup=userSignupconsirm ?userSignupconsirm.userId : null ;
    connection.query("SELECT * FROM login WHERE signupid = ? AND uniqueid = ?", [signup,userId], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            // Handle the error     
        } else {

            const userData = req.cookies.userId;
            let userId;
        
            if (userData) {
                userId = JSON.parse(userData).userId;
            


          
            
                connection.query('SELECT od.order_date,od.status,od.orderid,fd.Fname,fd.fprice FROM login AS l JOIN consumer AS c ON l.id=c.cid JOIN order_details AS od ON od.consumer_id=c.id Join food_item AS fd on fd.food_id=od.food_id   WHERE l.signupid = ? AND l.uniqueid = ?', [signup, userId], (error, resultprofile) => {
                    if (error) {
                        console.error('Error querying database:', error);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                   

                });
                res.render('profile', { signupinfo:results});
            }





            // console.log('User details:', results);
            // res.render('profile', { signupinfo:results});
        // Handle the results
        }

    });

})






app.post('/SignUp', (req, res) => {
    const username = req.body.username;
    const mail = req.body.mail;
    const phone = req.body.phonenumber;
    const id = req.query.id;

    let userData = req.cookies.userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }
    const uniqueid=userId;

    // Check if the user already exists in the database
   
         // Check if the user already exists in the database
         connection.query('SELECT * FROM login WHERE uniqueid = ? AND mail = ?', [uniqueid, mail], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            res.render('signupError'); // Render an error page
            return;
        }

        if (results.length > 0) {

            // to check it from cart or home
       if(id==2){
        const userData = req.cookies.userId;
        if (userData) {
            userId = JSON.parse(userData).userId;
        }
        connection.query('SELECT * FROM cart_item WHERE userId = ?', [userId], (error, results) => {
            if (error) {
                console.error('Error querying database:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            

            // to send the login confirmation to cart
            const userData=req.cookies.userData ?JSON.parse(req.cookies.userData):null;
    const username=userData ? userData.name : null
    const phone=userData? userData.phone:null;

    // Render he template
    if(username&& phone){
        issignup=1;
   
    }else{
        issignup=0;
    }
            // Handle query results
            res.render('cart',{items:results,issignup:issignup}); // For example, send results back to the client
        });
       }else{
        res.render('login');
       }
            // User already exists, render login page
            
        } else {
        
            connection.query("INSERT INTO login (name, mail, phone, uniqueid, signupid) VALUES (?, ?, ?, ?, ?)", [username, mail, phone, uniqueid, null], (error, results) => {
                if (error) {
                    console.error('Error inserting into database:', error);
                    res.render('signupError'); // Render an error page
                    return;
                }

                // User inserted successfully, generate a unique user ID and set a cookie
                const userId = mail;
                const expirationDate = new Date();
                expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Expires after 1 year
                res.cookie('usersignId', JSON.stringify({ userId }), { expires: expirationDate });

          
                res.redirect('/store_signup_details?mail=' + encodeURIComponent(mail) + '&id=' + encodeURIComponent(id));




        
            });
        }
    });
});


app.get('/store_signup_details',(req,res)=>{
    const mail = req.query.mail;
    const id = req.query.id;
    const userSignupconsirm=req.cookies.usersignId?JSON.parse(req.cookies.usersignId):null;
     const signup=userSignupconsirm ?userSignupconsirm.userId : null
    connection.query("UPDATE login SET signupid = ?  WHERE mail = ?", [signup, mail], (error, results) => {
        if (error) {
            console.error('Error updating database:', error);
            // Handle error
        } else {
            // Handle update success
            // For example, redirect user, display success message, etc.
        }
    });

    if(id==2){
        let userId;
        const userData = req.cookies.userId;
        if (userData) {
            userId = JSON.parse(userData).userId;
        }


        connection.query('SELECT ci.* FROM cart_item ci JOIN login l ON ci.userId = l.uniqueid WHERE l.signupid = ?', [signup], (error, results) => {
            if (error) {
                console.error('Error querying database:', error);
                res.status(500).send('Internal Server Error');
                return;
            }

            // to send the login confirmation to cart
            const userData=req.cookies.userData ?JSON.parse(req.cookies.userData):null;
    const username=userData ? userData.name : null
    const phone=userData? userData.phone:null;

    // Render he template
    if(username&& phone){
        issignup=1;
   
    }else{
        issignup=0;
    }
            // Handle query results
            res.render('cart',{items:results,issignup:issignup}); // For example, send results back to the client
        });
               }else{
                res.render('login');
               }


});



app.get('/login',(req,res)=>{
    res.render('login');
});





app.post("/login", (req, res) => {
    const id = req.query.id;
    const username = req.body.username;
  
    const phone = req.body.phonenumber;
    const userSignupconsirm=req.cookies.usersignId?JSON.parse(req.cookies.usersignId):null;
    const signup=userSignupconsirm ?userSignupconsirm.userId : null
    let userId;
    const userData = req.cookies.userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }

    // Query users from database
    connection.query('SELECT * FROM login WHERE name = ? AND phone = ?  AND uniqueid=? AND signupid=?', [username, phone,userId,signup], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            alert("Error in login, incorrect name or phone number");
            res.render('login');
            return;
            
        }
       
        if (results.length > 0) {
          
            // User found, set cookie and redirect to dashboard
            res.cookie('userData', JSON.stringify(results[0]), {
                maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days expiration
                httpOnly: true,
                sameSite: 'strict'
            });

            if(id==2){
                res.redirect('/send_info_to_cart');
            }
            else{
                res.render('home');
            }
        } else {
            if(id==2){
            res.render('cart', { items: null, issignup: null });
            }else{
            // User not found, redirect to login
            res.render('login');
            }
        } 
            // Set issignup based on whether the user is signed up or not
            
        });
    });    
app.get('/send_info_to_cart',(req,res)=>{
    const userData = req.cookies.userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }
    connection.query('SELECT * FROM cart_item WHERE userId = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
      
        // Handle query results
     
        // Render he template
   
            const userData=req.cookies.userData ?JSON.parse(req.cookies.userData):null;
            const username=userData ? userData.name : null
            const phone=userData? userData.phone:null;
        console.log(username);
            if(username&& phone){
                issignup=1;
            } else {
                issignup=0;
            }
            res.render('cart',{items:results,issignup:issignup});
 
        // res.render('cart',{items:results}); // For example, send results back to the client
    });
})
        
      


// For logout
app.get('/logout', (req, res) => {
    // Clear the userData cookie
    res.clearCookie('userData');

    // Redirect the user to the login page or any other destination
    res.render('home');
});



// to get profile  update 
app.post("/profile_update",(req,res)=>{
    const username = req.body.username;
    const mail = req.body.mail;
    const phone = req.body.phonenumber;
    let userId;
    const userData = req.cookies.userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }
    // Update the record with the specified uniqueid
    connection.query("UPDATE login SET name = ?, mail = ?, phone = ? WHERE uniqueid = ?", [username, mail, phone, userId], (error, results) => {
        if (error) {
            console.error('Error updating database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
       
    });
    connection.query("SELECT * FROM login WHERE uniqueid = ?", [userId], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            // Handle the error
        } else {
            console.log('First object:', results[0]);

            res.render('profile', { signupinfo: results });
        }
    });
    
});



// Route to fetch all food items cmming under restorants which is stored in menuitems to render the EJS template

app.get('/restorants',(req,res)=>{
    connection.query(' SELECT menuitems.item_id, menuitems.item_name, menuitems.price, food_item.fimage FROM menuitems JOIN food_item ON menuitems.food_item_id = food_item.food_id where menuitems.item_id=1 ; ',(err,result)=>{
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        result.forEach(item => {
            const base64Image = Buffer.from(item.fimage).toString('base64');
            item.base64Image = `data:image/jpeg;base64,${base64Image}`;
        });
        res.render('image', { items: result });
    });
});



app.get('/server.js', (req, res) => {
    
    const userData=req.cookies.userData ?JSON.parse(req.cookies.userData):null;
    const username=userData ? userData.name : null
    const phone=userData? userData.phone:null;

    // Render he template
    if(username&& phone){
        issignup=1;
   
    }else{
        issignup=0;
    }
 
    const foodItemId = req.query.foodItemId;
    // Now you can use the foodItemId as needed
    console.log("Food Item ID:", foodItemId);
    connection.query('SELECT * FROM restaurants WHERE restaurant_id = ?', [foodItemId], (error, results) => {
        if (error) {
          console.error('Error querying database:', error);
          res.status(500).send('Error querying database');
          return;
        }
    
        if (results.length === 0) {
          res.status(404).send('Food item not found');
          return;
        }
        connection.query('SELECT item_id,food_item_id,food_id, item_name,price,price,fimage FROM  menuitems join food_item on menuitems.food_item_id=food_item.food_id  where  restaurant_id = ?', [foodItemId], (error2, foodResults) => {
            if (error2) {
                console.error('Error querying database for food:', error2);
                res.status(500).send('Error querying database for food');
                return;
            }
    
    
            // Send the combined data to the template
    foodResults.forEach(item=>{
       const  base64Image=Buffer.from(item.fimage).toString('base64');
       item.base64Image=`data:images/jpeg;base64,${base64Image}`
    })
        res.render('restaurant_info',{ items: results[0] ,food:foodResults,issignup:issignup});
      });
});

});


// Add food items into cart
app.post('/addToCart', (req, res) => {
  
    const { food_id, itemName, price } = req.body;

    let userId;
    try {
        // Try parsing the userId cookie
        const userData = req.cookies.userId;
        if (userData) {
            userId = JSON.parse(userData).userId;
        }
    } catch (error) {
        console.error('Error parsing userId cookie:', error);
    }

    console.log("userId", userId);

    // Proceed with the database query only if userId is valid
    if (userId) {
        // Proceed with your database query using userId
        connection.query("INSERT INTO cart_item (userId, food_id, item_name, price) VALUES (?, ?, ?, ?)", [userId, food_id, itemName, price], (err, results) => {
            if (err) {
                console.error('Error inserting into cart_item:', err);
                // Handle the error
            } else {
                console.log('Inserted into cart_item:', results);
                // Handle the successful insertion
            }
        });
    } else {
        // If userId is not valid, generate a new one and set the cookie
        userId = generateUserId();
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Expires after 1 year
        res.cookie('userId', JSON.stringify({ userId }), { expires: expirationDate });

        // Redirect the user to the same route to retry the request
        res.redirect('/addToCart');
    }

 
});


app.get('/cart_item_list',(req,res)=>{
    try {
        let userId;
        let userData = req.cookies.userId;
        if (userData) {
            userId = JSON.parse(userData).userId;
        }
        if (userId) {
           
            const userSignupconsirm = req.cookies.usersignId ? JSON.parse(req.cookies.usersignId) : null;
            const signup = userSignupconsirm ? userSignupconsirm.userId : null;


          
                if (signup) {
                     connection.query('SELECT ci.* FROM cart_item ci JOIN login l ON ci.userId = l.uniqueid WHERE l.signupid = ?', [signup], (error, results) => {
                    if (error) {
                        console.error('Error querying database:', error);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    // Retrieve user data from cookies
                    const userData = req.cookies.userData ? JSON.parse(req.cookies.userData) : null;
                    const username = userData ? userData.name : null;
                    const phone = userData ? userData.phone : null;

                    // Initialize issignup variable based on user data
                    let issignup;
                    if (username && phone) {
                        issignup = 1; // If user data exists, set issignup to 1
                    } else {
                        issignup = 0; // If user data doesn't exist, set issignup to 0
                    }

                    // Render the cart template with the retrieved items
                    res.render('cart', { items: results, issignup: issignup });
                });
                    
                } else {
                    connection.query('SELECT * FROM cart_item WHERE userId = ?', [userId], (error, results) => {
                        if (error) {
                            console.error('Error querying database:', error);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        const userData=req.cookies.userData ?JSON.parse(req.cookies.userData):null;
                        const username=userData ? userData.name : null
                        const phone=userData? userData.phone:null;
                        if(username&& phone){
                            issignup=1;
                       
                        }else{
                            issignup=0;
                        }
                                // Handle query results
                                res.render('cart',{items:results,issignup:issignup});
                            });
                }
                


              
        } else {
            // Handle case where userId cookie is not present
            res.status(400).send('User ID cookie not found');
        }
    } catch (error) {
        console.error('Error parsing userId cookie:', error);
        res.status(500).send('Internal Server Error');
    }
    
});

app.get('/remove-item', (req, res) => {
    const foodId = req.query.itemId;
    const id=req.query.id;
    const userData = req.cookies.userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }
    const userSignupconsirm = req.cookies.usersignId ? JSON.parse(req.cookies.usersignId) : null;
    const signup = userSignupconsirm ? userSignupconsirm.userId : null;
    
   
    connection.query('SELECT uniqueid FROM login WHERE signupid = ?', [signup], (error, loginResults) => {
        if (error) {
            console.error('Error retrieving uniqueids:', error);
            // Handle error
        } else {
            // Extract uniqueids from the loginResults
            const uniqueids = loginResults.map(result => result.uniqueid);
            
            // Now, delete items from the cart_item table associated with these uniqueids and the given foodId
            connection.query('DELETE FROM cart_item WHERE userId IN (?) AND food_id = ? AND id = ?', [uniqueids, foodId,id], (error, deleteResults) => {
                if (error) {
                    console.error('Error deleting from cart_item:', error);
                    // Handle error
                } else {
                    console.log('Rows deleted from cart_item:', deleteResults.affectedRows);
                    // Handle success
                }
            });
            res.redirect("/show_delted_items");
        }
    });
});
app.get('/show_delted_items',(req,res)=>{


    try {
       
          


            const userSignupconsirm = req.cookies.usersignId ? JSON.parse(req.cookies.usersignId) : null;
            const signup = userSignupconsirm ? userSignupconsirm.userId : null;
        
                if (signup) {
                     connection.query('SELECT ci.* FROM cart_item ci JOIN login l ON ci.userId = l.uniqueid WHERE l.signupid = ?', [signup], (error, results) => {
                    if (error) {
                        console.error('Error querying database:', error);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    // Retrieve user data from cookies
                    const userData = req.cookies.userData ? JSON.parse(req.cookies.userData) : null;
                    const username = userData ? userData.name : null;
                    const phone = userData ? userData.phone : null;

                    // Initialize issignup variable based on user data
                    let issignup;
                    if (username && phone) {
                        issignup = 1; // If user data exists, set issignup to 1
                    } else {
                        issignup = 0; // If user data doesn't exist, set issignup to 0
                    }

                    // Render the cart template with the retrieved items
                    res.render('cart', { items: results, issignup: issignup });
                });
                    
                } else {
                    return render('signup');
                   
                }
                



         
    }catch (error) {
        console.error('Error parsing userId cookie:', error);
        res.status(500).send('Internal Server Error');
    }
});




function readImageFile(file) {
    // Read binary data from file
    const bitmap = fs.readFileSync(file);
    return bitmap;
}


app.post('/location',(req,res)=>{
    const latitude = req.body.latitude;
    const textarea=req.body.message;
    const longitude = req.body.longitude;
    const latitude_from_address=req.body.latitude_from_address;
    const longitude_from_address=req.body.longitude_from_address;

    console.log("lat",latitude);
    console.log("long",longitude);
    console.log(textarea);

    let userId;
    const userData = req.cookies.userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }
    

    // Initialize issignup variable based on user data
  
    const userSignupconsirm = req.cookies.usersignId ? JSON.parse(req.cookies.usersignId) : null;
    const signup = userSignupconsirm ? userSignupconsirm.userId : null;


    if (latitude && longitude) {
        console.log("You enter live location");
    // First, fetch the name from the login table
    connection.query("SELECT name,id FROM login WHERE uniqueid = ? AND signupid=?", [userId,signup], (error, loginResults) => {
        if (error) {
            console.error('Error fetching name from login table:', error);
            res.render('signupError'); // Render an error page
            return;
        }
  const id=loginResults[0].id;
        // Extract the name from the loginResults
        const name = loginResults[0].name;

        // check whether cid is already exists
        connection.query('SELECT * from consumer WHERE cid=?',[id],(err,results)=>{
        if (results.length > 0) {
            connection.query("UPDATE consumer SET name = ?, address = ?, payment = ?, latitude = ?, longitude = ? WHERE cid = ?", [name, null,null, latitude, longitude, id], (error, results) => {
                if (error) {
                    console.error('Error updating consumer table:', error);
                    res.render('signupError'); // Render an error page
                    return;
                }
                // Handle success
            });
        }else{
        // Now, insert into the consumer table along with the retrieved name
        connection.query("INSERT INTO consumer (cid, name, address, payment, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)", [id, name, null,null, latitude, longitude], (error, results) => {
            if (error) {
                console.error('Error inserting into consumer table:', error);
                res.render('signupError'); // Render an error page
                return;
            }
            // Handle success
        
        });
    }
    });

    });
}else if(textarea){
    console.log("You enter adress");
    connection.query("SELECT name,id FROM login WHERE uniqueid = ? AND signupid=?", [userId,signup], (error, loginResults) => {
        if (error) {
            console.error('Error fetching name from login table:', error);
            res.render('signupError'); // Render an error page
            return;
        }
        const id=loginResults[0].id;
        // Extract the name from the loginResults
        const name = loginResults[0].name;


        connection.query('SELECT * from consumer WHERE cid=?',[id],(err,results)=>{
            if (results.length > 0) {
                connection.query("UPDATE consumer SET name = ?, address = ?, payment = ?, latitude = ?, longitude = ? WHERE cid = ?", [name, textarea,null, latitude_from_address, longitude_from_address, id], (error, results) => {
                    if (error) {
                        console.error('Error updating consumer table:', error);
                        res.render('signupError'); // Render an error page
                        return;
                    }
                    // Handle success
                });
            }else{

        // Now, insert into the consumer table along with the retrieved name
        connection.query("INSERT INTO consumer (cid, name, address, payment, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)", [id, name, textarea,null,latitude_from_address,longitude_from_address], (error, results) => {
            if (error) {
                console.error('Error inserting into consumer table:', error);
                res.render('signupError'); // Render an error page
                return;
            }
          
        });
    }
});
});
    }





    if (signup) {
         connection.query('SELECT ci.* FROM cart_item ci JOIN login l ON ci.userId = l.uniqueid WHERE l.signupid = ?', [signup], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
     
        const userData2 = req.cookies.userData ? JSON.parse(req.cookies.userData) : null;
        const username = userData2 ? userData2.name : null;
        const phone = userData2 ? userData2.phone : null;
        if(username&&phone)
        {
          
            issignup=2;
            if(latitude || textarea)
            {
                issignup=3;
            }
            else{
                issignup=2;
            }
        }else {
            issignup=4;
        }
        // Render the cart template with the retrieved items
   
        res.render('cart', { items: results, issignup: issignup });
    });
        
    }else{
        res.render('signup')
    }
});


// Payment
app.get('/payment',(req,res)=>{
     const totalPrice = req.query.totalPrice;

  // Now you can use the totalPrice value in your server-side code
  console.log('Total Price:', totalPrice);

  // Your payment handling logic here
  // For example, render a payment page with the total price
  res.render('payment', { totalPrice });
});


app.post('/process_payment', (req, res) => {
    let userId;
    
    const userData = req.cookies.userId;
    if (userData) {
        userId = JSON.parse(userData).userId;
    }
    const userSignupconsirm = req.cookies.usersignId ? JSON.parse(req.cookies.usersignId) : null;
    const signup = userSignupconsirm ? userSignupconsirm.userId : null;

    const { amount } = req.body;
    console.log("Final", amount);

    connection.query("SELECT name,id FROM login WHERE uniqueid = ? AND signupid=?", [userId, signup], (error, loginResults) => {
        if (error) {
            console.error('Error fetching name from login table:', error);
            res.render('signupError'); // Render an error page
            return;
        }
        const id = loginResults[0].id;
        const cname=loginResults[0].name;
    
        connection.query("UPDATE consumer SET payment= ? WHERE cid = ?", [amount, id], (error, updateResults) => {
            if (error) {
                console.error('Error updating price:', error);
                res.render('signupError', { error: error }); // Render an error page with error details
                return;
            }
            // Handle success
            console.log('Payment successfully updated for user with ID:', id);

        });


      // Query to retrieve consumer's latitude and longitude based on consumer ID
connection.query('SELECT id,latitude, longitude FROM consumer WHERE cid = ?', [id], (err, consumerResults) => {
    if (err) {
        console.error('Error retrieving consumer data:', err);
        return;
    }
    
    // Extract consumer's latitude and longitude
    const consumerLat = consumerResults[0].latitude;
    const consumerLon = consumerResults[0].longitude;
    const conid=consumerResults[0].id;
    
    // Initialize variables to store the closest delivery person's details
    let closestDeliveryBoy = null;
    let shortestDistance = Infinity;
    
    // Query to retrieve delivery boys' latitude and longitude
    connection.query('SELECT id, name, email, latitude, longitude,phone_number FROM deliveryboy', (err, deliveryBoyResults) => {
        if (err) {
            console.error('Error retrieving delivery boys data:', err);
            return;
        }
        
        // Calculate distance for each delivery boy and find the closest one
        deliveryBoyResults.forEach((deliveryBoy) => {
            const distance = getDistanceFromLatLonInKm(consumerLat, consumerLon, deliveryBoy.latitude, deliveryBoy.longitude);
            // Check if this delivery boy is closer than the current closest one
            if (distance < shortestDistance) {
                // Update the closest delivery person found so far
                closestDeliveryBoy = { ...deliveryBoy, distance };
                shortestDistance = distance;
            }
        });
        
        // Display the closest delivery person
        if (closestDeliveryBoy) {
            console.log('Closest Delivery Boy to Consumer:');
console.log(`ID: ${closestDeliveryBoy.id}, Name: ${closestDeliveryBoy.name}, Email: ${closestDeliveryBoy.email}, Distance: ${closestDeliveryBoy.distance.toFixed(2)} km`);
const did = closestDeliveryBoy.id;       

const { v4: uuidv4 } = require('uuid');

// Generate a unique order ID
const orderId = uuidv4();

// First, retrieve the food_id values from the cart_item table based on the signup parameter
connection.query('SELECT ci.food_id FROM cart_item ci JOIN login l ON ci.userId = l.uniqueid WHERE l.signupid = ?', [signup], (error, results) => {
    if (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
        return;
    }

    // Extract food_id values from the results
    const foodIds = results.map(row => row.food_id);
   
    // Now, insert the retrieved food_id values into the order_details table along with other details
    const orderInsertQuery = `
        INSERT INTO order_details (orderid, consumer_id, food_id, deliveryboy_id, status)
        VALUES (?,?, ?, ?, 'success')
    `;

    // Prepare and execute the insert query for each food_id
    foodIds.forEach(foodId => {
        connection.query(orderInsertQuery, [orderId,conid, foodId, did], (error, results) => {
            if (error) {
                console.error('Error inserting into order_details:', error);
                // Handle error accordingly
            } else {
                console.log('Order details inserted successfully');
                // Process results if needed
            }
        });
    });
});
connection.query("UPDATE consumer SET orderid = ? WHERE cid = ?", [orderId, id], (error, results) => {
    if (error) {
        console.error('Error updating consumer table:', error);
        // Handle error accordingly
    } else {
        console.log('Consumer table updated successfully');
        // Process results if needed
    }
});

// Query consumer's details
connection.query('SELECT login.mail,login.phone FROM login JOIN consumer ON login.id = consumer.cid WHERE login.id = ?', [id], (err, result) => {
    if (err) {
        console.error('Error occurred:', err);
        return;
    }
    
    if (result.length > 0) {
        const cmail = result[0].mail;
        const cphone = result[0].phone;


connection.query('select * from order_details where orderid=?',[orderId],(err,results)=>{

    const order_date = results[0].order_date;
    const get_order_id = results[0].orderid;
  const deleveryboy_id=results[0].deliveryboy_id;
connection.query('select *from deliveryboy where id=?',[deleveryboy_id],(err,results)=>{

  const delivery_boy_id=results[0].id;
        // Setup transporter for sending emails
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'example@gmail.com', // your email address
                pass: 'It is mandatory' // your email password or application-specific password
            }
        });

        // Read the email template file
        const emailTemplate = fs.readFileSync('public/views/emailTemplate.ejs', 'utf8');

        // Render the HTML template with dynamic data
        const renderedHtml = ejs.render(emailTemplate, {
             id:delivery_boy_id,
            name: cname,
            clatitude: consumerLat,
            clongitude: consumerLon,
            order_date:order_date,
            get_order_id :get_order_id ,
            closestDeliveryBoy: closestDeliveryBoy
           
        });

        // Setup email options
        let mailOptions = {
            from: 'sender@gmail.com', // sender address
            to: cmail, // list of receivers
            subject: 'From TasteToDoor', 
            html: renderedHtml // HTML content of the email
        };

        // Send email to consumer
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error('Error occurred:', error);
            } else {
                console.log('Email sent to consumer:', info.response);
            }
        });






        // Query delivery boy's email
        connection.query('SELECT email FROM deliveryboy WHERE id=?', [did], (err, results) => {
            if (err) {
                console.error('Error occurred:', err);
                return;
            }

            if (results.length > 0) {
                const dmail = results[0].email;

                // Read the email template file for delivery boy
                const Todeliveryboy = fs.readFileSync('public/views/Todeliveryboy.ejs', 'utf8');

                // Render the HTML template with dynamic data for delivery boy
                const renderedHtmlDeliveryBoy = ejs.render(Todeliveryboy, {
                    name: cname,
                    id: id,
                    order_date:order_date,
                    get_order_id :get_order_id ,
                    clatitude: consumerLat,
                    clongitude: consumerLon,
                    phone: cphone,
                    closestDeliveryBoy: closestDeliveryBoy
               
                });

                // Setup email options for delivery boy
                let mailOptionsDeliveryBoy = {
                    from: 'sender@gmail.com', // sender address
                    to: dmail, // list of receivers
                    subject: 'From TasteToDoor', 
                    html: renderedHtmlDeliveryBoy // HTML content of the email
                };

                // Send email to delivery boy
                transporter.sendMail(mailOptionsDeliveryBoy, function(error, info) {
                    if (error) {
                        console.error('Error occurred:', error);
                    } else {
                        console.log('Email sent to delivery boy:', info.response);
                    }
                });
            }
        });
    });
    });
    }/////////////////////////////completed


    });//completed

}
 else {
            console.log('No delivery boy found.');
        }

});
            res.render("Endstatus");
     
    });
});
});


// for    trying purphose  updation is requuired
app.get('/locationtrace',(req,res)=>{
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    
    // Update user's location in the database or perform any necessary actions
    console.log('Updated location:', { latitude, longitude });
    res.render('locationtrace');
});





// get distance nearby
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    // Implementation of Haversine formula
    const R = 6371; // Radius of the earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
