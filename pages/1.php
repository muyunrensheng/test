<?php
	$recent = $_POST['recentPage'];
	$perpage = (int)$_POST['perPages']+1;
	
	$data = array();
	for($i=1;$i<$perpage;$i++){
		$data[] = array('name' => 'no.'.$i*$recent);
	}
	


	$respone = array();
	$respone['total'] = 200;
	
	
	
	$respone['data']=$data;

	echo json_encode($respone);


?>