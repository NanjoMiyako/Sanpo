import glob
import cv2

#画像リサイズ元のフォルダ内のファイル一覧
fileNameList = glob.glob("##入力画像元フォルダパス##/*")
#出力先フォルダ
outputFolder = "##出力先フォルダパス##"

count = 0;
for fileName in fileNameList:
	count = count + 1
	
	img = cv2.imread(fileName)
	width,height=200,200
	img = cv2.resize(img,(width, height))
	
	outFilePath = outputFolder
	outFilePath += str(count)
	outFilePath += ".jpg"
	cv2.imwrite(outFilePath,img)
	