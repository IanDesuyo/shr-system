import os

# 資料庫位置
os.environ["SQL_HOST"] = "sqlite:///database.db"
# os.environ["SQL_HOST"] = "mysql+pymysql://shrs:UEAIkyVRC7NuXsJy@localhost/SHRSystem"
# JWT秘鑰
os.environ["JWT_SECRET"] = "650c081e4c24461d9bc8de1b54b06c4a"

# JWT秘鑰過期時間(天)
os.environ["JWT_EXPIRE"] = "7"

# 藍芽溫度計密鑰
os.environ["BT_SECRET"] = "8e352bf7"

# 是否僅限使用藍芽額溫槍測量的人通過
os.environ["Need_tempVerified"] = ""  # 留空為False

# 員工是否需要輸入密碼
os.environ["Staff_Need_Password"] = "True"  # 留空為False

# 是否關閉員工登入
os.environ["Disable_Staff"] = ""  # 留空為False

# 是否關閉訪客回報
os.environ["Disable_Guest"] = ""  # 留空為False