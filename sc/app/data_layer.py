import sqlite3
import random

class Data_Layer(object):
    def __init__(self):
        self.conn = sqlite3.connect('test.db')
        self.cursor = self.conn.cursor()
        
    def close(self):
        self.conn.commit()
        self.conn.close()
        
    def query(self, sql):
        try:
            self.cursor.execute(sql)
            result = self.cursor.fetchall()
        except Exception, e:
            result = 'Query Failed: %s \nException: %s' % (sql, str(e))
            
        return result
