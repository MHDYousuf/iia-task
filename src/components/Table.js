import React, { useState } from 'react';
import {
	Button,
	Col,
	Table,
	Row,
	Modal,
	notification,
	Input,
	Form,
} from 'antd';
import reqwest from 'reqwest';

const { confirm } = Modal;

const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
		render: (name) => `${name.first} ${name.last}`,
		width: '20%',
	},
	{
		title: 'Email',
		dataIndex: 'email',
		width: '20%',
	},
	{
		title: 'Mobile Number',
		dataIndex: 'cell',
		width: '20%',
	},
	{
		title: 'Home Address',
		dataIndex: 'address',
		width: '20%',
		render: (_, record) =>
			record.address ? (
				<>
					<p>{record.address}</p>
				</>
			) : (
				<>
					<p>
						{record.location.city}, {record.location.country}, Pin:{' '}
						{record.location.postcode}
					</p>
				</>
			),
	},
	{
		title: 'Office Address',
		dataIndex: 'office',
		width: '20%',
		render: (_, record) =>
			record.office ? (
				<>
					<p>{record.office}</p>
				</>
			) : (
				<>
					<p>
						{record.location.city},{record.location.country},Pin:{' '}
						{record.location.postcode}
					</p>
				</>
			),
	},
];

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 24 },
};

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
	required: '${label} is required!',
	types: {
		email: '${label} is not a valid email!',
		number: '${label} is not a valid number!',
	},
	number: {
		range: '${label} must be between ${min} and ${max}',
	},
};

const Component = () => {
	const [form] = Form.useForm();
	const [data, setData] = useState([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 5,
		total: data.length,
	});
	const [loading, setLoading] = useState(false);

	const [isModalVisible, setIsModalVisible] = useState(false);

	const [selectedKey, setSelectedKey] = useState({});
	const [rowsSelected, setRowsSelected] = useState([]);

	React.useEffect(() => {
		fetch({ pagination });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetch = (params = {}) => {
		setLoading(true);
		reqwest({
			//you can change the retrieve number of results
			url: 'https://randomuser.me/api/?results=50',
			method: 'get',
			type: 'json',
		}).then((data) => {
			console.log(data);
			setLoading(false);
			setData(data.results);
			setPagination({
				...params.pagination,
			});
		});
	};

	const handleTableChange = (pagination, filters) => {
		// fetch({
		// 	pagination,
		// 	...filters,
		// });
		setPagination({
			pagination,
		});
	};

	const rowSelection = {
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectedKey(selectedRowKeys);
			setRowsSelected(selectedRows);
		},
		getCheckboxProps: (record) => ({
			name: record.name,
		}),
	};

	const handleDelete = (e) => {
		e.preventDefault();
		let recordsLength = rowsSelected.length;
		if (recordsLength > 0) {
			let enumRecord = recordsLength === 1 ? 'record' : 'records';

			confirm({
				title: `Do you Want to delete ${recordsLength} ${enumRecord}?`,
				content: 'Are you sure, you want to delete.',
				onOk() {
					let tempData = [...data];
					setData(
						tempData.filter((item) => {
							const isPresent = selectedKey.includes(item.login.uuid);
							if (!isPresent) {
								return item;
							}
							return null;
						})
					);
					setRowsSelected([]);
					notification.success({
						message: 'Record was deleted successfully',
					});
				},
			});
		} else {
			notification.info({
				message: 'Please Select a record',
				description: 'Select a Record to delete',
			});
		}
	};

	const showModal = () => {
		setIsModalVisible(true);
	};

	const onFinish = ({ user }) => {
		const { name, email, mobile, address, office } = user;
		setData([
			...data,
			{
				login: {
					uuid: Math.random(10000).toFixed(6),
				},
				name: {
					first: name,
					last: '',
				},
				email,
				cell: mobile,
				address,
				office,
			},
		]);
		setIsModalVisible(false);
		form.resetFields();
	};

	return (
		<Col span={24} className='table-container t-center'>
			<Col span={22}>
				<Modal
					title='Add a record'
					visible={isModalVisible}
					closable={true}
					onCancel={(e) => {
						e.preventDefault();
						setIsModalVisible(false);
					}}
					footer={null}
				>
					<Form
						{...layout}
						form={form}
						layout='vertical'
						name='nest-messages'
						onFinish={onFinish}
						validateMessages={validateMessages}
					>
						<Form.Item
							name={['user', 'name']}
							label='Name'
							rules={[
								{
									required: true,
								},
							]}
						>
							<Input placeholder='eg: John Doe' />
						</Form.Item>
						<Form.Item
							name={['user', 'email']}
							label='Email'
							rules={[
								{
									type: 'email',
									required: true,
								},
							]}
						>
							<Input placeholder='eg: jondoe@something.io' />
						</Form.Item>
						<Form.Item
							name={['user', 'mobile']}
							label='Mobile Number'
							rules={[
								{
									min: 1,
									max: 10,
									required: true,
								},
							]}
						>
							<Input placeholder='eg: 9512345678' />
						</Form.Item>
						<Form.Item
							name={['user', 'address']}
							label='Home Address'
							rules={[
								{
									required: true,
								},
							]}
						>
							<Input.TextArea placeholder='Where do you live?' />
						</Form.Item>
						<Form.Item
							name={['user', 'office']}
							label='Office Address (optional)'
						>
							<Input.TextArea placeholder='Where do you work?' />
						</Form.Item>
						<Form.Item wrapperCol={{ ...layout.wrapperCol }}>
							<Button type='primary' htmlType='submit'>
								Submit
							</Button>
						</Form.Item>
					</Form>
				</Modal>
				<Row className='btn-container'>
					<Button type='dashed' onClick={showModal}>
						Add Record
					</Button>
					<Button type='primary' danger onClick={handleDelete}>
						Delete Record
					</Button>
				</Row>
				<Table
					rowSelection={{
						type: 'checkbox',
						...rowSelection,
					}}
					bordered
					columns={columns}
					rowKey={(record) => record.login.uuid}
					dataSource={data}
					pagination={{
						defaultPageSize: 5,
						total: data.length,
						showSizeChanger: true,
						pageSizeOptions: [5, 10, 15, 20],
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} of ${total} items`,
						...pagination,
					}}
					loading={loading}
					onChange={handleTableChange}
				/>
			</Col>
		</Col>
	);
};

export default Component;
