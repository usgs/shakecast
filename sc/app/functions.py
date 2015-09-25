import time
from data_layer import Data_Layer

def loop1():
    print 'LOOP1'
    #dispatcher.send('to-server', task_name='loop1', data={'mydata': 'here it is!'})
    data={'status': 'finished', 'message': 'here it is, loop1!'}
    return data
def loop2():
    print 'LOOP2'
    #dispatcher.send('to-server', task_name='loop2', data={'mydata': 'here it is!'})
    data={'status': 'finished', 'message': 'here it is, loop2!'}
    return data

def long():
    for i in xrange(100):
        print i
        time.sleep(1)
    data={'status': 'finished',
          'message': 'Looped through 100 numbers! One second at a time!!'}
    return data

def short():
    for i in xrange(10):
        print i
        time.sleep(1)
    data={'status': 'finished',
          'message': 'Looped through 10 numbers! One second at a time!!'}
    return data


def manual(to_print=""):
    print 'Manual: %s' % to_print
    
    data={'status': 'finished', 'message': 'printed: %s' % to_print}
    return data
    
def my_print(to_print=""):
    print 'my_print'
    print 'Printing: %s' % to_print
    #dispatcher.send('to-server', task_name='my_print', data={'mydata': 'here it is!'})
    data={'status': 'finished', 'message': 'here it is!, manual!'}
    return data

def ins_random(count=10):
    dl = Data_Layer()
    count = int(count)
    
    for i in range(count):
        dl.query("INSERT INTO data (num, val) VALUES ('" + str(i) + "', 'aaSDasd');")

    # Uncomment the line below to mess with connections blocking
    # eachother
    #time.sleep(2)

    dl.close()
    
    return_str = 'Created ' + str(count) + ' new records'
    
    data={'status': 'finished', 'message': return_str}
    return data

def db_query(sql=""):
    dl = Data_Layer()
    result = dl.query(sql)
    return_str = "%s\n%s" % (sql, str(result))
    
    data={'status': 'finished', 'message': return_str}
    return data