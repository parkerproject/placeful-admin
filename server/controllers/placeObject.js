'use strict'
module.exports = function (obj) {
  let businessObject = {
    business_name: obj.merchant_name,
    business_email: obj.email,
    business_phone: obj.phone,
    business_map: null,
    business_address: obj.merchant_address,
    business_icon: obj.icon,
    business_locality: obj.merchant_locality,
    followers: [],
    subscriber: 'no',
    password: obj.password,
    referral_code: '',
    referral_code_redeemed: 0,
    business_id: obj.merchant_id,
    agreement: null,
    website: obj.website,
    tags: obj.tags,
    approved: false
  }

  return businessObject
}