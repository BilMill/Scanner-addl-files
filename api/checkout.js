import Stripe from "stripe";
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"POST required"});
 const key=(process.env.STRIPE_SECRET_KEY||"").trim();
 if(!/^(sk|rk)_live_[A-Za-z0-9]+$/.test(key))return res.status(503).json({error:"Stripe live API key is missing or invalid."});
 try{
  const stripe=new Stripe(key,{timeout:15000,maxNetworkRetries:1});
  const premium=req.body?.kind==="prosperity";
 const session=await stripe.checkout.sessions.create({mode:"payment",line_items:[premium?{price_data:{currency:"usd",unit_amount:499,product_data:{name:"Millionaire & Prosperity Reading"}},quantity:1}:{price:"price_1UeizCRV4tqvPXfMMo59GRXi",quantity:1}],success_url:"https://palmmystic-vercel.vercel.app/?session_id={CHECKOUT_SESSION_ID}",cancel_url:"https://palmmystic-vercel.vercel.app/?canceled=1",payment_method_types:["card"],metadata:{product:premium?"palmmystic_prosperity":"palmmystic_report"}});
  return res.status(200).json({url:session.url});
 }catch(e){console.error("Stripe checkout failure:",e.type||e.name,e.code||"",e.statusCode||"",e.cause?.code||"");return res.status(502).json({error:"Checkout temporarily unavailable."});}
}
