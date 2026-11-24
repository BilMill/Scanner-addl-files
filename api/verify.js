export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"GET required"});
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key)return res.status(503).json({paid:false,error:"Payment verification not configured."});
 const id=req.query?.session_id;
 if(typeof id!=="string"||!/^cs_(test_|live_)[A-Za-z0-9]+$/.test(id))return res.status(400).json({paid:false,error:"Invalid checkout session."});
 try{
  const response=await fetch("https://api.stripe.com/v1/checkout/sessions/"+encodeURIComponent(id),{headers:{"Authorization":"Bearer "+key},signal:AbortSignal.timeout(12000)});
  if(!response.ok){console.error("Stripe verification:",response.status);return res.status(502).json({paid:false,error:"Payment could not be verified."});}
  const session=await response.json();
  const paid=session.payment_status==="paid"&&session.status==="complete"&&session.mode==="payment"&&session.amount_total===100&&session.currency==="usd"&&session.livemode===true;
  return res.status(200).json({paid});
 }catch(e){console.error("Stripe verify connection:",e.name);return res.status(502).json({paid:false,error:"Verification temporarily unavailable."});}
}