const { arenaCalendarService } = require("../services/arenaCalendarService");

async function profile(request, reply) {
    try{
      const { id } = request.params;

      const res = await arenaCalendarService.providerById(id);

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

