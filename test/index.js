const db = require("../models");
const Groups = db.Groups;
const Members = db.Members;
const Profiles = db.Profiles;
const Requests = db.Requests;
const Supports = db.Supports;

async function createProfile(){
  try{
    let profile = new Profiles({
      username: "gooner",
      first_name: "Cuong",
      last_name: "Nguyen Van",
      gender: "1",
      avatar_url: "",
      date_of_birth : "2000-07-23",
      country: "VN",
      province: "TTH",
      district: "Phong Dien",
      ward: "Phong Binh",
      street: "Pho Trach",
      email: "cuong@mail.com",
      phone_number: "123456789",
      is_admin: 1,
      is_deactivated: 0,
      is_deleted: 0
    });
    console.log(profile);
    await profile.save();
    console.log("createProfile success");
  } catch(e){
    console.log("Error creating profile", e);
  }
}

async function getProfiles(){
  try {
    let profiles = await Profiles.findAll();
    console.log(profiles);
    console.log("getProfiles success");
  } catch (error) {
    console.log("Error getProfiles ", error)
  }
}

async function createGroup(){
  try {
    let group = new Groups({
      description: "group description",
      name: "group name",
      is_deleted: 0,
    });
    console.log(group);
    await group.save();
    console.log("createGroup success");
  } catch (error) {
    console.log("Error creating group", error)
  }
}

async function getGroups(){
  try {
    let groups = await Groups.findAll();
    console.log(groups);
    console.log("getGroups success");
  } catch (error) {
    console.log("Error getGroups ", error)
  }
}

async function createMember(){
  try {
    let member = new Members({
      id_group: 1,
      username: "gooner",
      as_role: 0,
      is_admin_invited: 0,
    });
    console.log(member);
    await member.save();
    console.log("createMember success");
  } catch (error) {
    console.log("Error creating member", error)
  }
}

async function getMembers(){
  try {
    let members = await Members.findAll();
    console.log(members);
    console.log("getMembers success");
  } catch (error) {
    console.log("Error getMembers ", error)
  }
}

async function createRequest(){
  try {
    let request = new Requests({
      id_group: 1,
      username: "gooner",
      content: "content request",
      is_deleted: 0,
      is_approved: 0
    });
    console.log(request);
    await request.save();
    console.log("createRequest success");
  } catch (error) {
    console.log("Error creating request", error)
  }
}

async function getRequests(){
  try {
    let requests = await Requests.findAll();
    console.log(requests);
    console.log("getRequests success");
  } catch (error) {
    console.log("Error getRequests ", error)
  }
}

async function createSupport(){
  try {
    let support = new Supports({
      id_request: 1,
      username: "gooner",
      content: "content support",
      is_confirmed: 0,
    });
    console.log(support);
    await support.save();
    console.log("createSupport success");
  } catch (error) {
    console.log("Error creating support", error)
  }
}

async function getSupports(){
  try {
    let supports = await Supports.findAll();
    console.log(supports);
    console.log("getSupports success");
  } catch (error) {
    console.log("Error getSupports ", error)
  }
}

async function test(){
  await createProfile();
  await getProfiles();
  await createGroup();
  await getGroups();
  await createMember();
  await getMembers();
  await createRequest();
  await getRequests();
  await createSupport();
  await getSupports();
}

test();

