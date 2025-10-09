const { arenaCalendarService } = require("../services/arenaCalendarService");

async function profile(request, reply) {
    try{
      const { nickname } = request.params;

      const res = await arenaCalendarService.providerByNickname(nickname);

      return reply.send(res);

    }catch(e){
      console.log(e);
      return reply.status(500).send({
        success: false,
        message:'Try again !',
        field: "Internal Server Error"
      })
    }
}

async function matches(request, reply){
  try{

    const { id } = request.params;
    const { time_end, time_start } = request.body;

    if(!id || !time_end || !time_start){
       return reply.code(400).send({
        success: false,
        message: "id, time_start and time_end are required"
      });
    }

    const res = await arenaCalendarService.matches(id, time_start, time_end);

    res.map((match)=>{
      const { name, phone } =  parseNameAndPhone(match.description);
      match.name = name;
      match.tel = phone;
      match.match_price = formatNumber(match.match_price);
      match.paid_amount = formatNumber(match.paid_amount);
      match.total_price = formatNumber(match.total_price);
      match.payment_solution = match.payment_status;
      match.payment_status = paymentStatus(match.total_price, match.paid_amount);
      if(match.match_discount){
        match.payment_detail = {
          promotion: match.match_discount.promotion,
        }
      }
    })

    return reply.send(res)

  }catch(e){
    console.log(e);
    return reply.status(500).send({
      success: false,
      message: "Try again",
      field: "Internal Server Error"
    })
  }
}

module.exports.arenaCalendarController = { profile, matches };

function parseNameAndPhone(str) {
  const parts = str.trim().split(/\s+/); // split by spaces

  if (parts.length === 0) {
    return null; // empty string
  }

  const lastPart = parts[parts.length - 1];
  const maybeName = parts.slice(0, -1).join(" ") || str;

  // phone = only digits, no '?'
  if (/^\d+$/.test(lastPart)) {
    return { name: maybeName, phone: lastPart };
  }

  // fallback: only name
  return { name: str, phone: null };
}

function formatNumber(num) {
  num = Number(num);
  return Number(num.toFixed(10))
    .toString()
    .replace(/\.0+$/, '')      // remove ".0"
    .replace(/(\.\d*[1-9])0+$/, '$1'); // remove trailing zeros
}

function paymentStatus(total, paid) {
  const leftToPay = total - paid;

  if (paid == 0) return 'unpaid';
  if (leftToPay == 0) return 'paid';
  return 'dep';
}