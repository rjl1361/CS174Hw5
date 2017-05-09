var config = {
	check_in_frequency: 1000,
	notify_delay: 1000,
	email_job_frequency: 1000,
			"SECRET_KEY": "INSERT YOUR KEY FROM THE STRIPE.COM", //this probably shouldn't be here :( 
    "PUBLISHABLE_KEY": "INSERT YOUR KEY FROM THE STRIPE.COM",
    "CHARGE_URL": "https://api.stripe.com/v1/charges",
    "CHARGE_CURRENCY": "usd",
    "CHARGE_DESCRIPTION": "Buyer sees this on their statement",
    "CHARGE_USERAGENT": "CreditCardTester",
    "TIMEOUT": 20
}

module.exports = config;
