from selenium import webdriver

from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoAlertPresentException
import time

options = Options()
options.add_experimental_option("detach", True)

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.get("https://localhost:8080")
driver.maximize_window()

details_button = driver.find_element(By.ID,"details-button")
details_button.click()

proceed_link = driver.find_element(By.ID,"proceed-link")
proceed_link.click()

login_button = driver.find_element("xpath","//*[@id='app']/div[1]/button")
login_button.click()
username_field = driver.find_element(By.ID,"email")
password_field = driver.find_element(By.ID,"password")

username_field.send_keys("Admin")
password_field.send_keys("Password")

login_button = driver.find_element("xpath",'//*[@id="loginModal"]/div/div/div[3]/button[3]')
login_button.click()
time.sleep(0.2)
logout_button = driver.find_element("xpath",'//*[@id="app"]/div[1]/button[2]').text
assert logout_button == "Logout"

add_button = driver.find_element("xpath",'//*[@id="app"]/button[1]')
add_button.click()

day_field = driver.find_element("xpath",'//*[@id="day"]')
day_field.send_keys("2023-09-12")

start_field = driver.find_element("xpath",'//*[@id="start"]')
start_field.send_keys("11:55")

end_field = driver.find_element("xpath",'//*[@id="end"]')
end_field.send_keys("14:00")

confirm_button = driver.find_element("xpath",'//*[@id="addEditModal"]/div/div/div[3]/button[2]')
confirm_button.click()
WebDriverWait(driver, 10).until(EC.alert_is_present())
alert = driver.switch_to.alert
alert.accept()
time.sleep(0.5)
added_time = driver.find_element("xpath",'//*[@id="timesTable"]/tbody/tr[8]/td[1]').text
assert added_time == "2023-09-12"

edit_button = driver.find_element("xpath",'//*[@id="timesTable"]/tbody/tr[3]/td[4]/button[2]')
edit_button.click()

day_field = driver.find_element("xpath",'//*[@id="day"]')
day_field.clear()
day_field.send_keys("2023-12-09")

start_field = driver.find_element("xpath",'//*[@id="start"]')
start_field.clear()
start_field.send_keys("12:00")

end_field = driver.find_element("xpath",'//*[@id="end"]')
end_field.clear()
end_field.send_keys("12:30")

confirm_button = driver.find_element("xpath",'//*[@id="addEditModal"]/div/div/div[3]/button[2]')
confirm_button.click()
WebDriverWait(driver, 10).until(EC.alert_is_present())
alert = driver.switch_to.alert
alert.accept()
time.sleep(0.2)
added_time = driver.find_element("xpath",'//*[@id="timesTable"]/tbody/tr[4]/td[1]').text
assert added_time == "2023-12-09"

book_button = driver.find_element("xpath",'//*[@id="timesTable"]/tbody/tr[4]/td[4]/button[2]')
book_button.click()

name_field = driver.find_element("xpath",'//*[@id="nameEdit"]')
name_field.send_keys("Arnold")

confirm_button = driver.find_element("xpath",'//*[@id="addEditModal"]/div/div/div[3]/button[2]')
confirm_button.click()
WebDriverWait(driver, 10).until(EC.alert_is_present())
alert = driver.switch_to.alert
alert.accept()
time.sleep(0.2)
assert "Arnold" in driver.page_source

cancel_button = driver.find_element("xpath",'//*[@id="timesTable"]/tbody/tr[2]/td[6]/button[2]')
cancel_button.click()
WebDriverWait(driver, 10).until(EC.alert_is_present())
alert = driver.switch_to.alert
alert.accept()
time.sleep(0.2)
assert "Arnold" not in driver.page_source

delete_button = driver.find_element("xpath",'//*[@id="timesTable"]/tbody/tr[4]/td[4]/button[3]')
delete_button.click()
WebDriverWait(driver, 10).until(EC.alert_is_present())
alert = driver.switch_to.alert
alert.accept()
time.sleep(0.2)
assert "2023-12-09" not in driver.page_source, "The text '2023-12-09' should not be present on the page."

driver.quit()