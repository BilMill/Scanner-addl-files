import Stripe from "stripe";
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="GET")return res.status(405).json({error:"GET required"});
 const key=(process.env.STRIPE_SECRET_KEY||"").trim();
 if(!/^(sk|rk)_live_[A-Za-z0-9]+$/.test(key))return res.status(503).json({paid:false,error:"Stripe live API key is missing or invalid."});
 const id=req.query?.session_id;
 if(typeof id!=="string"||!/^cs_live_[A-Za-z0-9]+$/.test(id))return res.status(400).json({paid:false,error:"Invalid checkout session."});
 try{
  const stripe=new Stripe(key,{timeout:15000,maxNetworkRetries:1});
  const session=await stripe.checkout.sessions.retrieve(id,{expand:["line_items"]});
  const item=session.line_items?.data?.[0];
  const premium=session.metadata?.product==="palmmystic_prosperity";
 const paid=session.payment_status==="paid"&&session.status==="complete"&&session.mode==="payment"&&session.amount_total===(premium?499:100)&&session.currency==="usd"&&session.livemode===true&&(premium?item?.price?.unit_amount===499:item?.price?.id==="price_1UeizCRV4tqvPXfMMo59GRXi")&&item.quantity===1;
  return res.status(200).json({paid,kind:premium?"prosperity":"classic"});
 }catch(e){console.error("Stripe verification failure:",e.type||e.name,e.code||"",e.statusCode||"");return res.status(502).json({paid:false,error:"Verification temporarily unavailable."});}
}
