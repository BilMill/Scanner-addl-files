export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"POST required"});
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key)return res.status(503).json({error:"Stripe checkout is not configured yet."});
 const params=new URLSearchParams();
 params.set("mode","payment");
 params.set("line_items[0][price]","price_1UeizCRV4tqvPXfMMo59GRXi");
 params.set("line_items[0][quantity]","1");
 params.set("success_url","https://palmmystic-vercel.vercel.app/?session_id={CHECKOUT_SESSION_ID}");
 params.set("cancel_url","https://palmmystic-vercel.vercel.app/?canceled=1");
 params.set("payment_method_types[0]","card");
 try{
  const response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/x-www-form-urlencoded"},body:params.toString(),signal:AbortSignal.timeout(12000)});
  const data=await response.json();
  if(!response.ok||!data.url){console.error("Stripe checkout:",response.status,data.error?.code);return res.status(502).json({error:"Unable to open checkout. Please try again later."});}
  return res.status(200).json({url:data.url});
 }catch(e){console.error("Stripe checkout connection:",e.name);return res.status(502).json({error:"Checkout temporarily unavailable."});}
}